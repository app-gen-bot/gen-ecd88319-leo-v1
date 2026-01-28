import { betterAuth } from "better-auth";

// For now, use simple in-memory database
// In production, you would use a real database adapter
const users = new Map();
const sessions = new Map();

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3095",
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
    },
  },
  
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (url: string, user: any) => {
      try {
        // Extract token from URL
        const token = new URL(url).searchParams.get('token');
        
        // Send email via our API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reset-password',
            email: user.email,
            name: user.name,
            token,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send password reset email');
        }
      } catch (error) {
        console.error('Error sending password reset email:', error);
      }
    },
  },
  
  session: {
    expiresIn: 60 * 30, // 30 minutes
    updateAge: 60 * 15, // Update session if older than 15 minutes
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3095",
  ],
  
  socialProviders: {
    // No social providers for demo
  },
});

// Export auth client for frontend use
export type Auth = typeof auth;

// Note: Better Auth client methods should be used from the client-side library
// These are just type exports