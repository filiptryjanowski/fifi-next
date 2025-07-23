import { NextRequest, NextResponse } from "next/server";
import pool from "../_pg";

const createTable = async () => {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT,
      price TEXT
    )
  `);
};

export async function GET() {
    await createTable();
    const result = await pool.query("SELECT * FROM services");
    return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
    await createTable();
    const { name, price } = await req.json();
    const info = await pool.query(
        "INSERT INTO services (name, price) VALUES ($1, $2) RETURNING *",
        [name, price]
    );
    const newService = info.rows[0];
    return NextResponse.json(newService, { status: 201 });
} 