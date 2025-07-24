import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "filiptryjanowki5@gmail.com",
        pass: "wkyx zigj dykm aedd"//
    },
});

export async function POST(req: NextRequest) {
    const { to, subject, text, replyTo } = await req.json();
    // Walidacja danych
    if (!to || typeof to !== 'string' || !/^\S+@\S+\.\S+$/.test(to)) {
        return NextResponse.json({ success: false, message: "Podaj poprawny adres e-mail odbiorcy." }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || subject.length < 2) {
        return NextResponse.json({ success: false, message: "Temat jest wymagany." }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || text.length < 2) {
        return NextResponse.json({ success: false, message: "Treść wiadomości jest wymagana." }, { status: 400 });
    }
    try {
        await transporter.sendMail({
            from: 'filiptryjanowki5@gmail.com',
            to, 
            subject,
            text,
            ...(replyTo ? { replyTo } : {})
        });
        return NextResponse.json({ success: true, message: "E-mail wysłany!" });
    } catch (err: any) {
        console.error("Błąd wysyłki e-maila:", err);
        return NextResponse.json({ success: false, message: "Błąd wysyłki e-maila" }, { status: 500 });
    }
} 