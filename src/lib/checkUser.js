import { auth } from "@/auth";
import { db } from "./prisma";

export const checkUser = async () => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // If user doesn't exist in database, create them
    // This handles the case where NextAuth session exists but user not in DB
    const newUser = await db.user.create({
      data: {
        id: session.user.id,
        name: session.user.name || "User",
        imageUrl: session.user.image || null,
        email: session.user.email,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
