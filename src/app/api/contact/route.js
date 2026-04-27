import { NextResponse } from "next/server";

// For testing: logs messages to console
export async function POST(req) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
  }

  console.log("New Contact Message:", { name, email, subject, message });

  return NextResponse.json({ success: true });
}

export async function GET(req) {
  return NextResponse.json({ success: true, messages: [] });
}