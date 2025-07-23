import { NextRequest, NextResponse } from "next/server";
import pool from "../_pg";

export async function POST(req: NextRequest) {
  const data = await req.json();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(
    "INSERT INTO contact (name, email, message) VALUES ($1, $2, $3)",
    [data.name || "", data.email || "", data.message || ""]
  );
  return NextResponse.json({ success: true, message: "Wiadomość zapisana!" });
} 