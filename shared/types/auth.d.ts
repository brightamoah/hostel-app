declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
    image: string | null;
    role: "student" | "admin";
    lastLogin?: Date;
    adminData?: Admin;
  };

  /**
   * Secure session data
   * Only available on the server.
   * Never exposed to the client!
   */
  interface SecureSessionData {
    accessToken?: string;
    refreshToken?: string;
    twoFactorVerified?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }

  interface UserSession {
    user: User;
    loggedInAt: Date;
    secure?: SecureSessionData;
    expiresAt: Date;
    onboarded: boolean;
  }
}

export { };
