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
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
        return NextResponse.json({ success: false, message: "Użytkownik już istnieje" }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hash]);
    return NextResponse.json({ success: true, message: "Rejestracja zakończona sukcesem" });
} 