import { student } from "~~/server/db/schema";
import { handleError } from "~~/server/utils/errorHandler";
import { eq } from "drizzle-orm";
import { ref } from "vue";

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    const errorMessage = ref<string | null>(null);

    if (!session.user || session.user.role !== "student" || !session.user.emailVerified) {
      errorMessage.value = "Forbidden: Must be a verified student";
      throw createError({
        statusCode: 403,
        message: "Forbidden: Must be a verified student",
      });
    }

    const { db } = useDB();

    const rawBody = await readBody(event);

    if (rawBody?.dateOfBirth && typeof rawBody.dateOfBirth === "string") rawBody.dateOfBirth = new Date(rawBody.dateOfBirth);

    const parsed = personalDetailsSchema.safeParse(rawBody);
    if (!parsed.success) {
      errorMessage.value = `Invalid data: ${parsed.error.issues.map(i => i.message).join(", ")}`;
      throw createError({
        statusCode: 400,
        message: `Invalid data: ${parsed.error.issues}`,
      });
    }

    const {
      gender,
      dateOfBirth,
      phoneNumber,
      address,
      emergencyContactName,
      emergencyContactPhoneNumber,
      emergencyContactEmail,
      healthConditions,
    } = parsed.data;

    const existingStudent = await db.query.student.findFirst({
      where: eq(student.userId, session.user.id),
    });
    if (existingStudent) {
      errorMessage.value = "Student details already exist";
      throw createError({
        statusCode: 409,
        message: "Student details already exist",
      });
    }

    if (!gender || !dateOfBirth || !phoneNumber || !address || !emergencyContactName || !emergencyContactPhoneNumber || !emergencyContactEmail) {
      throw createError({
        statusCode: 400,
        message: "All fields are required",
      });
    }

    // Insert student details
    const [newStudent] = await db.insert(student).values({
      userId: Number(session.user.id),
      address,
      dateOfBirth,
      emergencyContactEmail,
      emergencyContactName,
      emergencyContactPhoneNumber,
      phoneNumber,
      healthConditions,
      gender,
      residencyStatus: "inactive",
      enrollmentDate: new Date(),
    } as any).returning();

    if (!newStudent) {
      errorMessage.value = "Failed to save student details";
      throw createError({
        statusCode: 500,
        message: "Failed to save student details",
      });
    }

    // Update user's onboarded status
    await setUserSession(event, {
      ...session,
      onboarded: true,
    });

    return {
      success: true,
      message: "Onboarding completed successfully",
      errorMessage,
    };
  }
  catch (error) {
    handleError(error, "Onboarding", event);
  }
});
