// admin-route
import { NextResponse } from "next/server";
import db from "@/Backend/db";
import { UserModel } from "@/Backend/models/UserModel";
import { VerifyToken } from "@/helper/jwt";

export async function PUT(req) {
  try {
    await db();

    const token = req.cookies.get("CartifyToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = VerifyToken(token);

    // Only superadmin can change roles
    if (!payload || payload.role !== "superadmin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { userId, newRole } = await req.json();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}