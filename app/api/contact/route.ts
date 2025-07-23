import { NextRequest, NextResponse } from "next/server";
import db from "../_db";

export async function POST(req: NextRequest) {
    const data = await req.json();
    // Tworzenie tabeli jeśli nie istnieje
    db.prepare(`CREATE TABLE IF NOT EXISTS contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
    // Wstawianie danych
    db.prepare("INSERT INTO contact (name, email, message) VALUES (?, ?, ?)").run(
        data.name || "",
        data.email || "",
        data.message || ""
    );
    return NextResponse.json({ success: true, message: "Wiadomość zapisana!" });
} 