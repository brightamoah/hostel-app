import type { BillingInsert } from "~~/shared/types";

import { and, eq, ne, sql } from "drizzle-orm";

import type { paymentMethod } from "../schema";

import { billing, payment } from "../schema";

const billingWithRelations = {
  with: {
    student: {
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    },
    allocation: true,
    hostel: true,
    payments: true,
  },

} as const;

type PaymentMethodType = typeof paymentMethod.enumValues[number];

export async function billingQueries() {
  const { db } = useDB();

  const getBillingById = async (billingId: number) => {
    return await db
      .query
      .billing
      .findFirst({
        where: eq(billing.id, billingId),
        extras: {
          invoiceNumber: sql<string>`'INV-' || lpad(${billing.id}::text, 6, '0')`.as("invoice_number"),
        },
        ...billingWithRelations,
      });
  };

  const getScopedBillingsAdmin = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db
        .query
        .billing
        .findMany({
          extras: {
            invoiceNumber: sql<string>`'INV-' || lpad(${billing.id}::text, 6, '0')`.as("invoice_number"),
          },
          ...billingWithRelations,
        });
    }

    if (!admin.hostelId) return [];

    return await db
      .query
      .billing
      .findMany({
        where: eq(billing.hostelId, admin.hostelId),
        extras: {
          invoiceNumber: sql<string>`'INV-' || lpad(${billing.id}::text, 6, '0')`.as("invoice_number"),
        },
        ...billingWithRelations,
      });
  };

  const getBillingStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) {
        return {
          totalBillings: 0,
          totalPaid: 0,
          totalUnpaid: 0,
          totalPending: 0,
          totalOverdue: 0,
        };
      }
      whereConditions.push(eq(billing.hostelId, admin.hostelId));
    }

    //  Exclude cancelled bills from calculations to keep data accurate
    whereConditions.push(ne(billing.status, "cancelled"));

    const [result] = await db
      .select({
        totalBillings: sql<number>`coalesce(sum(${billing.amount}), 0)`,
        totalPaid: sql<number>`coalesce(sum(${billing.paidAmount}), 0)`,
        totalUnpaid: sql<number>`coalesce(sum(${billing.amount} - ${billing.paidAmount}), 0)`,
        totalOverdue: sql<number>`coalesce(sum(
        CASE WHEN ${billing.dueDate} < NOW() AND ${billing.status} != 'fully paid' 
        THEN ${billing.amount} - ${billing.paidAmount} 
        ELSE 0 END
      ), 0)`,
        totalPending: sql<number>`coalesce(sum(
        CASE WHEN ${billing.dueDate} >= NOW() AND ${billing.status} != 'fully paid' 
        THEN ${billing.amount} - ${billing.paidAmount} 
        ELSE 0 END
      ), 0)`,
      })
      .from(billing)
      .where(and(...whereConditions));

    return {
      totalBillings: Number(result?.totalBillings),
      totalPaid: Number(result?.totalPaid || 0),
      totalUnpaid: Number(result?.totalUnpaid || 0),
      totalPending: Number(result?.totalPending || 0),
      totalOverdue: Number(result?.totalOverdue || 0),
    };
  };

  const getStudentScopedBillings = async (studentId: number) => {
    return await db
      .query
      .billing
      .findMany({
        where: eq(billing.studentId, studentId),
        extras: {
          invoiceNumber: sql<string>`'INV-' || lpad(${billing.id}::text, 6, '0')`.as("invoice_number"),
        },
        ...billingWithRelations,
      });
  };

  const getStudentBillingStatusCount = async (studentId: number) => {
    const [result] = await db
      .select({
        totalBillings: sql<number>`coalesce(sum(${billing.amount}), 0)`,
        totalPaid: sql<number>`coalesce(sum(${billing.paidAmount}), 0)`,
        totalUnpaid: sql<number>`coalesce(sum(${billing.amount} - ${billing.paidAmount}), 0)`,
        totalOverdue: sql<number>`coalesce(sum(
        CASE WHEN ${billing.dueDate} < NOW() AND ${billing.status} != 'fully paid' 
        THEN ${billing.amount} - ${billing.paidAmount} 
        ELSE 0 END
      ), 0)`,
        totalPending: sql<number>`coalesce(sum(
        CASE WHEN ${billing.dueDate} >= NOW() AND ${billing.status} != 'fully paid' 
        THEN ${billing.amount} - ${billing.paidAmount} 
        ELSE 0 END
      ), 0)`,

      })
      .from(billing)
      .where(eq(billing.studentId, studentId));

    return {
      totalBillings: Number(result?.totalBillings),
      totalPaid: Number(result?.totalPaid || 0),
      totalUnpaid: Number(result?.totalUnpaid || 0),
      totalPending: Number(result?.totalPending || 0),
      totalOverdue: Number(result?.totalOverdue || 0),
    };
  };

  const createBilling = async (data: BillingInsert) => {
    const [result] = await db
      .insert(billing)
      .values(data)
      .returning();
    return result;
  };

  const checkExistingPayment = async (reference: string) => {
    const result = await db
      .query
      .payment
      .findFirst({
        where: eq(payment.transactionReference, reference),
      });
    return result;
  };

  const createPaymentIntent = async (
    billingId: number,
    studentId: number,
    amount: number,
    reference: string,
  ) => {
    await db.insert(payment).values({
      billingId,
      studentId,
      amount: amount.toString(),
      transactionReference: reference,
      paymentMethod: "card",
      status: "pending",
      paymentDate: new Date(),
    });
  };

  const markPaymentAsFailed = async (reference: string) => {
    await db
      .update(payment)
      .set({ status: "failed" })
      .where(eq(payment.transactionReference, reference));
  };

  const processSuccessfulPayment = async (
    billingId: number,
    reference: string,
    paymentMethod: PaymentMethodType,
    verifiedAmount: number,
    // newPaidTotal?: number,
    // newStatus: typeof billing.status.enumValues[number],
  ) => {
    await db.update(payment)
      .set({
        amount: sql`${verifiedAmount}::numeric`,
        status: "completed",
        paymentDate: new Date(),
        paymentMethod,
      })
      .where(eq(payment.transactionReference, reference));
  };

  // async function verifyPayment(
  //   billingId: number,
  //   reference: string,
  //   paymentMethod: PaymentMethodType,
  //   verifiedAmount: number,
  //   newPaidTotal: number,
  //   newStatus: typeof billing.status.enumValues[number],
  // ) {
  //   const { db } = useDB();

  //   await db.transaction(async (tx) => {
  //     const [currentBilling] = await tx
  //       .select()
  //       .from(billing)
  //       .where(eq(billing.id, billingId))
  //       .limit(1);

  //     if (!currentBilling) throw new Error("Billing record not found.");

  //     await tx.insert(payment).values({
  //       billingId,
  //       studentId: currentBilling.studentId,
  //       amount: verifiedAmount.toString(),
  //       transactionReference: reference,
  //       paymentMethod,
  //       status: "completed",
  //       paymentDate: new Date(),
  //     });

  //     await tx
  //       .update(billing)
  //       .set({
  //         paidAmount: newPaidTotal.toString(),
  //         status: newStatus,
  //         updatedAt: new Date(),
  //       })
  //       .where(eq(billing.id, billingId));
  //   });
  // }

  return {
    getBillingById,
    getScopedBillingsAdmin,
    getBillingStatusCount,
    createBilling,
    getStudentScopedBillings,
    getStudentBillingStatusCount,
    checkExistingPayment,
    createPaymentIntent,
    markPaymentAsFailed,
    processSuccessfulPayment,
    // verifyPayment,
  };
}

type BillingWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof billingQueries>>["getBillingById"]>>;
export type BillingType = NonNullable<BillingWithRelations>;
