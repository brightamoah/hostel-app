import { useDB } from "~~/server/utils/db";
import { and, count, desc, eq, gt, inArray, isNotNull, lt, or, sql } from "drizzle-orm";

import { admin, allocation, billing, hostel, loginAttempts, maintenanceRequest, room, student, user, visitor } from "../schema";

const ATTEMPT_WINDOW_MINUTES = 15;
// type Allocation = typeof allocation.$inferSelect;

const userDetails = {
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  isEmailVerified: user.emailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  hostelName: hostel.name,
  student: {
    id: student.id,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,
    phoneNumber: student.phoneNumber,
    address: student.address,
    emergencyContactName: student.emergencyContactName,
    emergencyContactPhoneNumber: student.emergencyContactPhoneNumber,
    healthConditions: student.healthConditions,
    enrollmentDate: student.enrollmentDate,
    residencyStatus: student.residencyStatus,
    roomNumber: room.roomNumber,
    allocation: sql<Allocation | null>`
            json_build_object(
              'id', ${allocation.id},
              'status', ${allocation.status},
              'roomId', ${allocation.roomId}
            )
          `.as("allocation"),
  },
  admin: {
    id: admin.id,
    phoneNumber: admin.phoneNumber,
    department: admin.department,
    accessLevel: admin.accessLevel,
    hostelId: admin.hostelId,
    status: admin.status,
  },
};

const today = new Date().toISOString();

const studentWithRelations = {
  with: {
    user: {
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        lastLogin: true,
      },
    },
    allocation: {
      with: {
        room: {
          with: {
            hostel: true,
            allocations: {
              with: {
                student: {
                  columns: {
                    id: true,
                    residencyStatus: true,
                    phoneNumber: true,
                  },
                  with: {
                    user: {
                      columns: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    billings: true,
    payments: true,
    maintenanceRequests: true,
    complaints: true,
    visitors: {
      where: eq(visitor.visitDate, today),
      orderBy: desc(visitor.visitDate),
    },
  },
} as const;

export async function userQueries() {
  const { db } = useDB();

  /**
   * Updates the `lastLogin` field for a user to the current date and time.
   * @async
   * @param userId The ID of the user to update.
   * @returns A promise that resolves when the user's last login has been successfully updated.
   */
  async function updateUserLastLogin(userId: number) {
    await db.update(user).set({
      lastLogin: new Date(),
    }).where(eq(user.id, userId));
  }

  async function cleanupExpiredVerificationTokens() {
    const now = new Date();

    const result = await db.update(user)
      .set({
        verificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(
        and(
          isNotNull(user.verificationToken),
          lt(user.verificationTokenExpiresAt, now),
        ),
      );
    return result;
  }

  const getFailedAttemptsCount = async (
    filteredField: FailedAttempts,
    filteredValue: string | number,
  ): Promise<number> => {
    const windowStartTimestamp = Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000;

    const [result] = await db
      .select({ value: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(filteredField, filteredValue),
          eq(loginAttempts.success, false),
          gt(loginAttempts.timestamp, new Date(windowStartTimestamp)),
        ),
      );

    return result?.value ?? 0;
  };

  const recordLoginAttempt = async (userId: number | null, ip: string, success = false): Promise<void> => {
    await db
      .insert(loginAttempts)
      .values({
        userId,
        ip,
        timestamp: new Date(),
        success,
      });
  };

  const getUserByEmail = async (email: string) => {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return existingUser;
  };

  const getUserById = async (id: number) => {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, id),
    });
    return existingUser;
  };

  const getStudentByUserId = async (id: number) => {
    const existingStudent = await db.query.student.findFirst({
      where: eq(student.userId, id),
    });
    return existingStudent;
  };

  const getOnboardedStudent = async (id: number) => {
    const existingStudent = await db.query.student.findFirst({
      where: eq(student.userId, id),
    });
    return existingStudent;
  };

  const getAllUsers = async () => {
    const users = await db
      .select(userDetails)
      .from(user)
      .leftJoin(student, eq(student.userId, user.id))
      .leftJoin(admin, eq(admin.userId, user.id))
      .leftJoin(allocation, eq(allocation.studentId, student.id))
      .leftJoin(room, eq(room.id, allocation.roomId))
      .leftJoin(hostel, or(eq(hostel.id, admin.hostelId), eq(hostel.id, room.hostelId)))
      .orderBy(user.id);

    return users;
  };

  const getTotalStudents = async () => {
    const count = await db
      .query
      .user
      .findMany({ where: eq(user.role, "student") })
      .then(students => students.length);
    return count;
  };

  const getTotalAdmins = async () => {
    const count = await db
      .query
      .admin
      .findMany()
      .then(admins => admins.length);
    return count;
  };

  const getActiveStudentsCount = async () => {
    const count = await db
      .query
      .student
      .findMany({ where: eq(student.residencyStatus, "active") });
    return count.length;
  };

  const getAdminByUserId = async (userId: number, activeOnly = false) => {
    const whereConditions = [eq(admin.userId, userId)];

    if (activeOnly) whereConditions.push(eq(admin.status, "active"));

    const [result] = await db
      .select()
      .from(admin)
      .where(and(...whereConditions));

    return result;
  };

  const checkIfUserExists = async (email: string): Promise<boolean> => {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return !!existingUser;
  };

  const getUsersScoped = async (adminId: number) => {
    const adminRecord = await getAdminByUserId(adminId);
    if (!adminRecord) throw createError({ statusCode: 404, message: "Admin not found" });

    let query = db
      .select(userDetails)
      .from(user)
      .leftJoin(student, eq(student.userId, user.id))
      .leftJoin(admin, eq(admin.userId, user.id))
      .leftJoin(allocation, eq(allocation.studentId, student.id))
      .leftJoin(room, eq(room.id, allocation.roomId))
      .leftJoin(hostel, or(eq(hostel.id, admin.hostelId), eq(hostel.id, room.hostelId)))
      .$dynamic();

    // Filter for non-super admins
    if (adminRecord.accessLevel !== "super") {
      if (!adminRecord.hostelId) {
        throw createError({
          statusCode: 403,
          message: "Access denied: Your admin account is not assigned to a hostel.",
        });
      }

      query = query.where(eq(hostel.id, adminRecord.hostelId));
    }

    const users = await query.orderBy(user.id);

    // If user has both admin & student roles, nullify student
    const normalized = users.map((u) => {
      if (u.student.allocation && u.student.allocation.id === null) u.student.allocation = null;

      if (u.role === "admin" && u.admin?.id) return { ...u, student: null };

      return u;
    });

    // Compute counts dynamically
    const totalUsers = normalized.length;
    const totalAdmins = normalized.filter(u => u.role === "admin").length;
    const totalStudents = normalized.filter(u => u.role === "student").length;
    const activeStudents = normalized.filter(u => u.student?.residencyStatus === "active").length;

    return {
      users: normalized,
      totalUsers,
      totalStudents,
      totalAdmins,
      activeStudents,
      adminRecord,
    };
  };

  const deleteUsersByIds = async (ids: number[]) => {
    if (ids.length === 0) return [];

    const deletedUsers = await db
      .delete(user)
      .where(inArray(user.id, ids))
      .returning();

    return deletedUsers;
  };

  const getUserByIds = async (ids: number[]) => {
    const users = await db
      .select({
        id: user.id,
        role: user.role,
        admin: {
          id: admin.id,
          accessLevel: admin.accessLevel,
        },
        student: {
          id: student.id,
          residencyStatus: student.residencyStatus,
          allocation: sql<Allocation>`
            json_build_object(
              'id', ${allocation.id},
              'status', ${allocation.status},
              'roomId', ${allocation.roomId}
            )
          `.as("allocation"),
        },
      })
      .from(user)
      .leftJoin(admin, eq(admin.userId, user.id))
      .leftJoin(student, eq(student.userId, user.id))
      .leftJoin(allocation, eq(allocation.studentId, student.id))
      .where(inArray(user.id, ids));

    return users;
  };

  const createOrUpdateAdminForUser = async (userId: number, payload: {
    phoneNumber?: string;
    department?: string;
    accessLevel?: "regular" | "super" | "support";
    hostelId?: number | null;
  }) => {
    return await db.transaction(async (tx) => {
      const existingAdmin = await tx.query.admin.findFirst({
        where: eq(admin.userId, userId),
      });

      if (existingAdmin) {
        const [updatedUser] = await tx
          .update(admin)
          .set({
            phoneNumber: payload.phoneNumber ?? existingAdmin.phoneNumber,
            department: payload.department ?? existingAdmin.department,
            accessLevel: payload.accessLevel ?? existingAdmin.accessLevel,
            hostelId: payload.hostelId === undefined ? existingAdmin.hostelId : payload.hostelId,
            status: "active",
          })
          .where(eq(admin.userId, userId))
          .returning();

        await tx.update(user).set({ role: "admin" }).where(eq(user.id, userId));
        return updatedUser;
      }

      const [insertedAdmin] = await tx
        .insert(admin)
        .values({
          userId,
          phoneNumber: payload.phoneNumber!,
          department: payload.department!,
          accessLevel: payload.accessLevel!,
          hostelId: payload.hostelId,
          status: "active",
        })
        .returning();

      await tx.update(user).set({ role: "admin" }).where(eq(user.id, userId));

      return insertedAdmin;
    });
  };

  const disableAdminByUserId = async (userId: number) => {
    return await db.transaction(async (tx) => {
      const [demotedAdmin] = await tx
        .update(admin)
        .set({ status: "inactive" })
        .where(eq(admin.userId, userId))
        .returning();

      if (!demotedAdmin) return null;

      await tx.update(user).set({ role: "student" }).where(eq(user.id, userId));

      return demotedAdmin;
    });
  };

  const getStudentForDashboardByUserId = async (userId: number) => {
    const studentRecord = await db.query.student.findFirst({
      where: eq(student.userId, userId),
      ...studentWithRelations,
    });

    if (!studentRecord) return null;

    const studentId = studentRecord.id;

    const [[billingStats], [maintenanceStats], [visitorStats]] = await Promise.all([
      db
        .select({
          totalBilled: sql<string>`coalesce(sum(${billing.amount}), '0')`,
          totalPaid: sql<string>`coalesce(sum(${billing.paidAmount}), '0')`,
        })

        .from(billing)
        .where(eq(billing.studentId, studentId)),

      db
        .select({ count: count() })
        .from(maintenanceRequest)
        .where(and(
          eq(maintenanceRequest.studentId, studentId),
          eq(maintenanceRequest.status, "pending"),
        )),

      db.select({ count: count() })
        .from(visitor)
        .where(
          eq(visitor.studentId, studentId),
        ),
    ]);

    const totalBilled = Number.parseFloat(billingStats?.totalBilled || "0");
    const totalPaid = Number.parseFloat(billingStats?.totalPaid || "0");
    const outstandingBalance = totalBilled - totalPaid;

    const pendingMaintenanceCount = maintenanceStats?.count || 0;

    const totalVisitors = visitorStats?.count || 0;

    return {
      studentRecord,
      totalBilled,
      totalPaid,
      outstandingBalance,
      pendingMaintenanceCount,
      totalVisitors,
    };
  };

  return {
    updateUserLastLogin,
    cleanupExpiredVerificationTokens,
    getUserByEmail,
    getUserById,
    getOnboardedStudent,
    getAllUsers,
    getTotalStudents,
    getTotalAdmins,
    getActiveStudentsCount,
    getAdminByUserId,
    checkIfUserExists,
    getUsersScoped,
    deleteUsersByIds,
    getUserByIds,
    createOrUpdateAdminForUser,
    disableAdminByUserId,
    getFailedAttemptsCount,
    recordLoginAttempt,
    getStudentByUserId,
    getStudentForDashboardByUserId,
  };
}

type StudentWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof userQueries>>["getStudentForDashboardByUserId"]>>;
export type StudentDashboard = NonNullable<StudentWithRelations>;
