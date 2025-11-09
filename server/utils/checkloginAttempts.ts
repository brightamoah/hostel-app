import { userQueries } from "../db/queries/user";
import { loginAttempts } from "../db/schema";

const MAX_FAILED_ATTEMPTS_PER_IP = 10;
const MAX_FAILED_ATTEMPTS_PER_USER = 5;

export async function checkUserLockedOutByIp(ip: string) {
  const { getFailedAttemptsCount, recordLoginAttempt } = await userQueries();

  const ipFailedAttempts = await getFailedAttemptsCount(
    loginAttempts.ip,
    ip,
  );

  const failed = ipFailedAttempts >= MAX_FAILED_ATTEMPTS_PER_IP;
  if (failed) {
    await recordLoginAttempt(null, ip);
    throw createError({
      statusCode: 429,
      message:
          "Too many failed login attempts from this IP. Please try again later.",
    });
  }
}

export async function checkUserLockOutByUserId(userId: number, ip: string): Promise<void> {
  const { getFailedAttemptsCount, recordLoginAttempt } = await userQueries();

  const userFailedCount = await getFailedAttemptsCount(
    loginAttempts.ip,
    ip,
  );

  if (userFailedCount >= MAX_FAILED_ATTEMPTS_PER_USER) {
    await recordLoginAttempt(userId, ip);
    throw createError({
      statusCode: 429,
      message:
          "Too many failed login attempts for this user. Please try again later.",
    });
  }
}
