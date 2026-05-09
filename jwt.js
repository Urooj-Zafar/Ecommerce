import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
if (!ACCESS_SECRET) throw new Error("JWT_SECRET is not defined");

export function GenAccessToken(payload) {
  return jwt.sign(
    { id: payload.id, userName: payload.userName, role: payload.role },
    ACCESS_SECRET,
    { expiresIn: "7d" }
  );
}

export function VerifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
}