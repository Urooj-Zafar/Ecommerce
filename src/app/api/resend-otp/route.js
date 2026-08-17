import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";
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

    const { email } = await req.json();

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

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;

    user.otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await transporter.sendMail({
      from: `"EliteShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "EliteShop OTP Verification",

      html: `
        <h2>EliteShop Verification</h2>

        <p>Your new OTP is:</p>

        <h1 style="letter-spacing:8px;">
          ${otp}
        </h1>

        <p>This OTP expires in <b>10 minutes</b>.</p>
      `,
    });

    return Response.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}