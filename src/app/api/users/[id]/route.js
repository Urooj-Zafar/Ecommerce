
import db from "@/Backend/db";
import { UserModel } from "@/Backend/models";

export async function DELETE(req, { params }) {
  await db();
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "ID is required" }), { status: 400 });

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ message: "User deleted successfully!" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}