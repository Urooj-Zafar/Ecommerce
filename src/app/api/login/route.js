import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";
import bcrypt from "bcryptjs";
import { GenAccessToken } from "@/helper/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await db();

    const { userName, password } = await req.json();

    if (!userName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ userName });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email first",
        },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = GenAccessToken({
      id: user._id.toString(),
      userName: user.userName,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",

      user: {
        _id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });

    // IMPORTANT: create cookie
    response.cookies.set("EliteShop", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error during login",
      },
      { status: 500 }
    );
  }
}