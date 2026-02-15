-- =====================================================
-- 1. FUNCTION: Cancel unpaid allocations after 3 days
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_unpaid_allocations () RETURNS TABLE (cancelled_count INTEGER) LANGUAGE plpgsql AS $$
DECLARE
  count INTEGER := 0;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT 
      a.id AS allocation_id,
      a.room_id,
      b.id AS billing_id
    FROM allocation a
    INNER JOIN billing b ON b.allocation_id = a.id
    WHERE 
      a.status = 'pending'
      AND b.type = 'hostel fee'
      AND DATE(a.allocation_date) <= CURRENT_DATE - INTERVAL '3 days'
      AND CAST(b.paid_amount AS NUMERIC) < CAST(b.amount AS NUMERIC) * 0.6
  LOOP
    UPDATE allocation SET status = 'cancelled' WHERE id = rec.allocation_id;
    UPDATE billing SET status = 'cancelled', updated_at = NOW() WHERE id = rec.billing_id;
    UPDATE room SET 
      current_occupancy = GREATEST(current_occupancy - 1, 0),
      status = CASE
        WHEN current_occupancy - 1 <= 0 THEN 'vacant'::room_status
        WHEN current_occupancy - 1 < capacity THEN 'partially occupied'::room_status
        ELSE status
      END
    WHERE id = rec.room_id;
    count := count + 1;
  END LOOP;
  
  RETURN QUERY SELECT count;
END;
$$;

-- =====================================================
-- 2. FUNCTION: Apply 5% weekly late fee to overdue billings
--    ONLY for active/pending allocations
-- =====================================================
CREATE OR REPLACE FUNCTION apply_weekly_late_fees () RETURNS TABLE (updated_count INTEGER, total_late_fees NUMERIC) LANGUAGE plpgsql AS $$
DECLARE
  u_count INTEGER;
  t_fees NUMERIC;
BEGIN
  WITH updated AS (
    UPDATE billing b
    SET 
      late_fee = CAST(b.late_fee AS NUMERIC) + (CAST(b.amount AS NUMERIC) * 0.05)::NUMERIC,
      updated_at = NOW()
    FROM allocation a
    WHERE 
        b.allocation_id = a.id
        AND b.status = 'overdue'
        AND a.status IN ('active', 'pending')
      AND (
        -- Calculate weeks overdue vs times late fee already applied
        FLOOR((CURRENT_DATE - DATE(b.due_date))::NUMERIC / 7) >
        CASE 
          WHEN CAST(b.amount AS NUMERIC) > 0 
          THEN FLOOR(CAST(b.late_fee AS NUMERIC) / (CAST(b.amount AS NUMERIC) * 0.05))
          ELSE 0 
        END
      )
    RETURNING b.late_fee
  )
  SELECT COUNT(*)::INTEGER, COALESCE(SUM(CAST(late_fee AS NUMERIC)), 0)
  INTO u_count, t_fees
  FROM updated;
  
  RETURN QUERY SELECT u_count, t_fees;
END;
$$;

-- =====================================================
-- 3. FUNCTION: Mark billings as overdue
-- =====================================================
CREATE OR REPLACE FUNCTION mark_overdue_billings () RETURNS TABLE (updated_count INTEGER) LANGUAGE plpgsql AS $$
DECLARE
  count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE billing b
    SET status = 'overdue', updated_at = NOW()
    FROM allocation a
    WHERE 
        b.allocation_id = a.id
        AND DATE(b.due_date) < CURRENT_DATE
        AND b.status IN ('unpaid', 'partially paid')
        AND a.status IN ('active', 'pending')
    RETURNING b.id
  )
  SELECT COUNT(*)::INTEGER INTO count FROM updated;
  
  RETURN QUERY SELECT count;
END;
$$;

-- =====================================================
-- 4. TRIGGER: Auto-update billing & allocation on payment
--    (This runs immediately - no scheduling needed!)
-- =====================================================
CREATE OR REPLACE FUNCTION handle_payment_completion () RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  billing_record RECORD;
  allocation_record RECORD;
  new_paid_amount NUMERIC;
  new_status billing_status;
BEGIN
  -- Only process when payment status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    -- Get billing record
    SELECT * INTO billing_record FROM billing WHERE id = NEW.billing_id;
    
    IF FOUND THEN
      -- Get allocation record to check status
      SELECT * INTO allocation_record FROM allocation WHERE id = billing_record.allocation_id;
      
      -- Only update if allocation is not cancelled
      IF FOUND AND allocation_record.status != 'cancelled' THEN
        new_paid_amount := CAST(billing_record.paid_amount AS NUMERIC) + CAST(NEW.amount AS NUMERIC);
        
        -- Determine billing status
        IF new_paid_amount >= CAST(billing_record.amount AS NUMERIC) + CAST(billing_record.late_fee AS NUMERIC) THEN
          new_status := 'fully paid';
        ELSE
          new_status := 'partially paid';
        END IF;
        
        -- Update billing
        UPDATE billing
        SET 
          paid_amount = new_paid_amount,
          status = new_status,
          updated_at = NOW()
        WHERE id = NEW.billing_id;
        
        -- Activate allocation if 60% threshold met and status is pending
        IF new_paid_amount >= CAST(billing_record.amount AS NUMERIC) * 0.6 
           AND allocation_record.status = 'pending' THEN
          UPDATE allocation
          SET status = 'active'
          WHERE id = billing_record.allocation_id;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_payment_completion ON payment;

CREATE TRIGGER trigger_handle_payment_completion
AFTER INSERT
OR
UPDATE OF status ON payment FOR EACH ROW
EXECUTE FUNCTION handle_payment_completion ();