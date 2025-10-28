import { useDB } from "~~/server/utils/db";
import { and, eq, inArray, isNotNull, lt, or, sql } from "drizzle-orm";

import type { Allocation } from "~/types";

import { admin, allocation, hostel, room, student, user } from "../schema";

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
  },
};

export const userQueries = defineEventHandler(async () => {
  const { db } = useDB();

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

  const getAdminByUserId = async (userId: number) => {
    const existingAdmin = await db.query.admin.findFirst({
      where: eq(admin.userId, userId),
      columns: {
        id: true,
        phoneNumber: true,
        department: true,
        accessLevel: true,
        hostelId: true,
      },
    });
    return existingAdmin;
  };

  const checkIfUserExists = async (email: string): Promise<boolean> => {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return !!existingUser;
  };

  const getUsersScoped = async (adminId: number) => {
    const adminRecord = await getAdminByUserId(adminId);
    if (!adminRecord)
      throw createError({ statusCode: 404, message: "Admin not found" });

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
      if (u.student.allocation && u.student.allocation.id === null) {
        u.student.allocation = null;
      }

      if (u.admin?.id) {
        return { ...u, student: null };
      }
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
    if (ids.length === 0)
      return [];

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
  };
});
