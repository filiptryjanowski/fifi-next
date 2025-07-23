import { NextRequest, NextResponse } from "next/server";
import db from "../_db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    if (!email || !password) {
        return NextResponse.json({ success: false, message: "Email i hasło są wymagane" }, { status: 400 });
    }
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`).run();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
        return NextResponse.json({ success: false, message: "Nieprawidłowy e-mail lub hasło" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return NextResponse.json({ success: false, message: "Nieprawidłowy e-mail lub hasło" }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: { email } });
} 