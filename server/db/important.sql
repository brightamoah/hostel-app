-- ALTER SEQUENCE public.user_id_seq INCREMENT BY 1 MINVALUE 10000000 MAXVALUE 99999999 START WITH 10000000 CYCLE RESTART WITH 10000000;

-- ALTER SEQUENCE public.student_id_seq INCREMENT BY 1 MINVALUE 10000000 MAXVALUE 99999999 START WITH 10000000 CYCLE RESTART WITH 10000000;

-- ALTER SEQUENCE public.admin_id_seq INCREMENT BY 1 MINVALUE 10000000 MAXVALUE 99999999 START WITH 10000000 CYCLE RESTART WITH 10000000;

-- INSERT INTO room (
--   room_number,
--   building,
--   floor,
--   capacity,
--   room_type,
--   current_occupancy,
--   features,
--   amount_per_year,
--   status
-- ) VALUES
-- ('Q107','Queens',2,4,'quad',0,ARRAY['Wardrobe','Study Desk','Cupboard'],'1200.00','vacant'),
-- ('Q108','Queens',2,3,'triple',1,ARRAY['Wardrobe','Study Desk','Mini-fridge'],'1600.00','partially occupied'),
-- ('Q109','Queens',2,2,'double',0,ARRAY['AC','Wardrobe','Mini-fridge','Study Desk'],'2100.00','vacant'),
-- ('Q110','Queens',3,1,'single',0,ARRAY['AC','Mini-fridge','Balcony','Wardrobe','Study Desk'],'2600.00','vacant'),

-- ('V105','Vikings',2,4,'quad',0,ARRAY['Wardrobe','Study Desk'],'1100.00','vacant'),
-- ('V106','Vikings',2,3,'triple',0,ARRAY['Wardrobe','Cupboard','Study Desk'],'1500.00','vacant'),
-- ('V107','Vikings',2,2,'double',1,ARRAY['AC','Mini-fridge','Study Desk'],'2000.00','partially occupied'),
-- ('V108','Vikings',3,1,'single',0,ARRAY['AC','Mini-fridge','Balcony','Wardrobe'],'2500.00','vacant'),

-- ('A101','Atlas',1,4,'quad',0,ARRAY['Wardrobe','Study Desk','Cupboard'],'1250.00','vacant'),
-- ('A102','Atlas',1,3,'triple',0,ARRAY['Wardrobe','Desk','Mini-fridge'],'1550.00','vacant'),
-- ('A103','Atlas',2,2,'double',1,ARRAY['AC','Mini-fridge','Study Desk'],'2100.00','partially occupied'),
-- ('A104','Atlas',2,1,'single',0,ARRAY['AC','Mini-fridge','Balcony'],'2600.00','vacant'),

-- ('B101','Bravo',1,4,'quad',0,ARRAY['Wardrobe','Cupboard'],'1100.00','vacant'),
-- ('B102','Bravo',2,3,'triple',1,ARRAY['Wardrobe','Desk'],'1500.00','partially occupied'),
-- ('B103','Bravo',2,2,'double',0,ARRAY['AC','Mini-fridge','Desk'],'2000.00','vacant'),
-- ('B104','Bravo',3,1,'single',0,ARRAY['AC','Mini-fridge','Balcony','Wardrobe'],'2500.00','vacant'),

-- ('C101','Crimson',1,4,'quad',0,ARRAY['Wardrobe','Desk'],'1200.00','vacant'),
-- ('C102','Crimson',2,3,'triple',0,ARRAY['Wardrobe','Cupboard','Study Desk'],'1500.00','vacant'),
-- ('C103','Crimson',2,2,'double',0,ARRAY['AC','Mini-fridge','Desk'],'2000.00','vacant'),
-- ('C104','Crimson',3,1,'single',0,ARRAY['AC','Mini-fridge','Balcony','Wardrobe'],'2600.00','vacant');

INSERT INTO
    hostel (
        name,
        address,
        contact_number,
        email,
        status
    )
SELECT DISTINCT
    ON (r.building) -- Ensures only one entry per building
    r.building || ' Hostel' AS name,
    r.building || ' - University Campus Hostel' AS address,
    '0549684848' AS contact_number,
    'kingshostelmgt' || ROW_NUMBER() OVER (
        ORDER BY r.building
    ) || '@gmail.com' AS email,
    'active' AS status
FROM room r
ON CONFLICT (email) DO NOTHING;
-- Prevents errors if an email already exists