import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function verifyAdmin() {
  try {
    const token = cookies().get("EliteShopToken")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return null;

    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req) {
  await db();

  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  }

  const users = await UserModel.find().select("-password");
  return NextResponse.json({ success: true, users });
}

export async function POST(req) {
  await db();

  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { fullName, userName, password, role } = await req.json();

  if (!fullName || !userName || !password) {
    return NextResponse.json(
      { message: "All fields required" },
      { status: 400 }
    );
  }

  const existing = await UserModel.findOne({ userName });
  if (existing) {
    return NextResponse.json(
      { message: "Username already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    fullName,
    userName,
    password: hashedPassword,
    role: role || "user",
  });

  return NextResponse.json({
    success: true,
    message: "User created",
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      userName: newUser.userName,
      role: newUser.role,
    },
  });
}

export async function PUT(req) {
  await db();

  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "User ID required" },
      { status: 400 }
    );
  }

  const { fullName, userName, password, role } = await req.json();

  const updateData = { fullName, userName, role };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).select("-password");

  return NextResponse.json({
    success: true,
    message: "User updated",
    user: updatedUser,
  });
}

export async function DELETE(req) {
  await db();

  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "User ID required" },
      { status: 400 }
    );
  }

  await UserModel.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "User deleted",
  });
}