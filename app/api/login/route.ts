import { NextRequest, NextResponse } from "next/server";
import pool from "../_pg";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    if (!email || !password) {
        return NextResponse.json({ success: false, message: "Email i hasło są wymagane" }, { status: 400 });
    }
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "Nieprawidłowy e-mail lub hasło" }, { status: 401 });
    }
    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return NextResponse.json({ success: false, message: "Nieprawidłowy e-mail lub hasło" }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: { email } });
} 