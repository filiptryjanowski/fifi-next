import { NextRequest, NextResponse } from "next/server";
import db from "../_db";

// Tworzenie tabeli jeśli nie istnieje
const createTable = () => {
    db.prepare(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price TEXT
  )`).run();
};

export async function GET() {
    createTable();
    const services = db.prepare("SELECT * FROM services").all();
    return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
    createTable();
    const { name, price } = await req.json();
    const info = db.prepare("INSERT INTO services (name, price) VALUES (?, ?)").run(name, price);
    const newService = { id: info.lastInsertRowid, name, price };
    return NextResponse.json(newService, { status: 201 });
} 