import { NextRequest, NextResponse } from "next/server";
import db from "../_db";

// Rate limiting: jedno zgłoszenie na 30 sekund na IP
const g = globalThis as Record<string, unknown>;
const rateLimitMap = (g.rateLimitMap_contact as Map<string, number>) || new Map<string, number>();
g.rateLimitMap_contact = rateLimitMap;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const last = rateLimitMap.get(ip) || 0;
  if (now - last < 30_000) {
    return NextResponse.json({ success: false, message: "Możesz wysłać zgłoszenie raz na 30 sekund." }, { status: 429 });
  }
  rateLimitMap.set(ip, now);
  const data = await req.json();
  // Walidacja danych
  if (!data.name || typeof data.name !== 'string' || data.name.length < 2) {
    return NextResponse.json({ success: false, message: "Podaj poprawne imię." }, { status: 400 });
  }
  if (!data.email || typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email)) {
    return NextResponse.json({ success: false, message: "Podaj poprawny adres e-mail." }, { status: 400 });
  }
  if (!data.message || typeof data.message !== 'string' || data.message.length < 5) {
    return NextResponse.json({ success: false, message: "Wiadomość jest za krótka." }, { status: 400 });
  }
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