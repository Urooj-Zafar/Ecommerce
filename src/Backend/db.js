// Backend/db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.mongoDb;
if (!MONGO_URI) throw new Error("MONGO_URI is not defined");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function db() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI)
      .then((mongoose) => {
        console.log("Database connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}