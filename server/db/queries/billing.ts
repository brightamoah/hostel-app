import { and, eq, ne, sql } from "drizzle-orm";

import { billing } from "../schema";

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

  return {
    getBillingById,
    getScopedBillingsAdmin,
    getBillingStatusCount,
  };
}

type BillingWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof billingQueries>>["getBillingById"]>>;
export type BillingType = NonNullable<BillingWithRelations>;
