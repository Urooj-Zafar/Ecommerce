import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await db();

    const {
      fullName,
      userName,
      email,
      password,
    } = await req.json();

    if (!fullName || !userName || !email || !password) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const existingEmail = await UserModel.findOne({
      email,
    });

    if (existingEmail) {
      return Response.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 400 }
      );
    }

    const existingUsername = await UserModel.findOne({
      userName,
    });

    if (existingUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await UserModel.create({
      fullName,
      userName,
      email,
      password: hashedPassword,

      role: "user",

      isVerified: false,

      otp,

      otpExpiry: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    });

    await transporter.sendMail({
      from: `"EliteShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "EliteShop Email Verification",

      html: `
        <div style="font-family:Arial,sans-serif;">
          <h2>Welcome to EliteShop</h2>

          <p>Thank you for creating an account.</p>

          <p>Your verification code is:</p>

          <h1 style="
            color:#000;
            letter-spacing:8px;
            font-size:32px;
          ">
            ${otp}
          </h1>

          <p>This OTP expires in <b>10 minutes</b>.</p>

          <p>
            If you did not create this account,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return Response.json(
      {
        success: true,
        message: "OTP sent successfully",
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Server error during registration",
      },
      { status: 500 }
    );
  }
}