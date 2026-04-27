import { NextResponse } from "next/server";

let subscribers = [];

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
  }
  subscribers.push(email);
  console.log("New subscriber:", email);

  return NextResponse.json({ success: true });
}

export async function GET(req) {
  return NextResponse.json({ success: true, subscribers });
}