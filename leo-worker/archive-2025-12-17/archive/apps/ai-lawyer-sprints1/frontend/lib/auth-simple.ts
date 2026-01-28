import { betterAuth } from "better-auth";

// For demo purposes, we use a simple in-memory adapter
// In production, you would use a real database
const users = new Map();
const sessions = new Map();

// Initialize with demo user
users.set('demo_user_123', {
  id: 'demo_user_123',
  email: 'demo@example.com',
  name: 'Demo User',
  password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // hashed "DemoRocks2025!"
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3095",
  secret: process.env.BETTER_AUTH_SECRET || 'PhQ5Pk+0iJ03dWr6Tq0L+/CXZA1x7TsES3EYj+kM0h4=',
  
  database: {
    provider: "custom",
    custom: {
      user: {
        create: async (data: any) => {
          const id = `user_${Date.now()}`;
          const user = { ...data, id };
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
          const updated = { ...user, ...data };
          users.set(id, updated);
          return updated;
        },
      },
      session: {
        create: async (data: any) => {
          const id = `session_${Date.now()}`;
          const session = { ...data, id };
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
      console.log("Password reset link:", url);
      // In production, you would send an email here
    },
  },
  
  session: {
    expiresIn: 60 * 30, // 30 minutes
    updateAge: 60 * 5, // Update session every 5 minutes
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3095",
  ],
  
  socialProviders: {
    // No social providers for demo
  },
});