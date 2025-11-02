import { PrismaClient } from "@prisma/client";

// Handle missing DATABASE_URL gracefully
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Please configure your database connection.");
    // Return a mock client that will throw helpful errors
    return new Proxy({}, {
      get() {
        throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
      }
    });
  }

  // Supabase connection pool configuration for serverless environments
  // Important: Use Supabase connection pooler URL (Transaction mode) for Vercel
  // The shared pooler URL should look like: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  // Supabase's pooler handles connection pooling, so Prisma will work with it directly
  
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

// Fix: Use globalThis in both development and production to prevent connection pool exhaustion
// In serverless environments like Vercel, we need to reuse the client instance
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = db;
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
