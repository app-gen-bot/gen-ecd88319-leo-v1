import { betterAuth } from "better-auth";

// For now, use in-memory storage until we can properly configure DynamoDB
// In production, this should be replaced with proper database adapter
const users = new Map();
const sessions = new Map();
const accounts = new Map();
const verifications = new Map();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3095",
  secret: process.env.BETTER_AUTH_SECRET!,
  
  database: {
    provider: "custom",
    custom: {
      user: {
        create: async (data: any) => {
          const id = `user_${Date.now()}`;
          const user = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
          users.set(id, user);
          return user;
        },
        findOne: async (data: any) => {
          if (data.id) return users.get(data.id);
          if (data.email) {
            for (const user of Array.from(users.values())) {
              if (user.email === data.email) return user;
            }
          }
          return null;
        },
        update: async (id: string, data: any) => {
          const user = users.get(id);
          if (!user) return null;
          const updated = { ...user, ...data, updatedAt: new Date() };
          users.set(id, updated);
          return updated;
        },
      },
      session: {
        create: async (data: any) => {
          const id = `session_${Date.now()}`;
          const session = { ...data, id, createdAt: new Date() };
          sessions.set(id, session);
          return session;
        },
        findOne: async (data: any) => {
          if (data.id) return sessions.get(data.id);
          if (data.token) {
            for (const session of Array.from(sessions.values())) {
              if (session.token === data.token) return session;
            }
          }
          return null;
        },
        update: async (id: string, data: any) => {
          const session = sessions.get(id);
          if (!session) return null;
          const updated = { ...session, ...data };
          sessions.set(id, updated);
          return updated;
        },
        delete: async (id: string) => {
          sessions.delete(id);
        },
      },
      account: {
        create: async (data: any) => {
          const id = `account_${Date.now()}`;
          const account = { ...data, id };
          accounts.set(id, account);
          return account;
        },
        findOne: async (data: any) => {
          if (data.id) return accounts.get(data.id);
          if (data.userId && data.providerId) {
            for (const account of Array.from(accounts.values())) {
              if (account.userId === data.userId && account.providerId === data.providerId) {
                return account;
              }
            }
          }
          return null;
        },
      },
      verification: {
        create: async (data: any) => {
          const id = `verification_${Date.now()}`;
          const verification = { ...data, id, createdAt: new Date() };
          verifications.set(id, verification);
          return verification;
        },
        findOne: async (data: any) => {
          if (data.id) return verifications.get(data.id);
          if (data.token) {
            for (const verification of Array.from(verifications.values())) {
              if (verification.token === data.token) return verification;
            }
          }
          return null;
        },
        update: async (id: string, data: any) => {
          const verification = verifications.get(id);
          if (!verification) return null;
          const updated = { ...verification, ...data };
          verifications.set(id, updated);
          return updated;
        },
        delete: async (id: string) => {
          verifications.delete(id);
        },
      },
    },
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION === 'true',
    sendResetPassword: async (url: string, user: any) => {
      try {
        // Send email via our API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reset-password',
            email: user.email,
            name: user.name,
            resetLink: url,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send password reset email');
        }
      } catch (error) {
        console.error('Error sending password reset email:', error);
      }
    },
    sendVerificationEmail: async (url: string, user: any) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'verify-email',
            email: user.email,
            name: user.name,
            verificationLink: url,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send verification email');
        }
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    },
  },
  
  session: {
    expiresIn: 60 * 30, // 30 minutes
    updateAge: 60 * 15, // Update session if older than 15 minutes
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3095",
  ],
  
});

// Export type for client usage
export type Auth = typeof auth;