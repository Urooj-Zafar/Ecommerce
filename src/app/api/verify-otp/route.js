import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await db();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        {
          success: false,
          message: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      email,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "Account already verified",
        },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return Response.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    if (
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return Response.json(
        {
          success: false,
          message: "OTP expired",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // Automatically login after verification
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return Response.json(
      {
        success: true,
        message: "Account verified successfully",

        token,

        user: {
          _id: user._id,
          fullName: user.fullName,
          userName: user.userName,
          email: user.email,
          role: user.role,
          photo: user.photo,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}