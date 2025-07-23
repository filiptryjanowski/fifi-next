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
    const userExists = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (userExists) {
        return NextResponse.json({ success: false, message: "Użytkownik już istnieje" }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 10);
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hash);
    return NextResponse.json({ success: true, message: "Rejestracja zakończona sukcesem" });
} 