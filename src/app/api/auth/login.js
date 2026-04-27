// /api/auth/login.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await db();
  const { userName, password } = await req.json();

  const user = await UserModel.findOne({ userName });
  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return NextResponse.json({
    success: true,
    user: { userName: user.userName, role: user.role },
    token,
  });
}