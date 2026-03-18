import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/Backend/db';
import { UserModel } from '@/Backend/models';


export async function POST(req) {
  await db();
  const { userName, password } = await req.json();

  if (!userName || !password) {
    return NextResponse.json({ success: false, message: 'Fill all fields!' }, { status: 400 });
  }

  const user = await UserModel.findOne({ userName });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }

  const token = await GenAccessToken({
    userName: user.userName,
    fullName: user.fullName,
    id: user._id.toString(),
    role: user.role ,
  });

  const response = NextResponse.json({
  success: true,
  message: 'Login successful',
  user: {
    userName: user.userName,
    role: user.role,   // ✅ SEND ROLE TO FRONTEND
  }
});
  response.cookies.set('EliteShop', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, 
  });

  return response;
}
