import { useDB } from "~~/server/utils/db";
import { and, eq, isNotNull, lt } from "drizzle-orm";

import { admin, student, user } from "../schema";

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
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.emailVerified,
        image: user.image,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
        },
        admin: {
          id: admin.id,
          phoneNumber: admin.phoneNumber,
          department: admin.department,
          accessLevel: admin.accessLevel,
        },
      })
      .from(user)
      .leftJoin(student, and(eq(student.userId, user.id), eq(user.role, "student")))
      .leftJoin(admin, and(eq(admin.userId, user.id), eq(user.role, "admin")))
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
    });
    return existingAdmin;
  };

  const checkIfUserExists = async (email: string): Promise<boolean> => {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return !!existingUser;
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
  };
});
