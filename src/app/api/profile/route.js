import db from '@/Backend/db';
import { UserModel } from '@/Backend/models';
import { VerifyToken } from '@/Backend/utils/jwt';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await db();

    const token = req.cookies.get('EliteShop')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token' }, { status: 401 });
    }

    const payload = VerifyToken(token);

    if (!payload?.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 403 });
    }

    const user = await UserModel.findById(payload.id).select('-password');

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: user });

  } catch (error) {
    console.error('Profile route error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}