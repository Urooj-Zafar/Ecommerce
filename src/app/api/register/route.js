import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";

export async function POST(req) {
  try {
    await db();
    const { fullName, userName, password, role } = await req.json();

    if (!fullName || !userName || !password) {
      return NextResponse.json(
        { success: false, message: "Fill all fields!" },
        { status: 400 }
      );
    }

    const existing = await UserModel.findOne({ userName });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      fullName,
      userName,
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json(
      { success: true, message: "User registered" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}