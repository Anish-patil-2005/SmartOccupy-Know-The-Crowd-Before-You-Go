import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // FIX 1: Add 'await' to auth()
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role } = body;

    // FIX 2: Create the client instance asynchronously
    const client = await clerkClient();

    // FIX 3: Use the 'client' variable to update metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}