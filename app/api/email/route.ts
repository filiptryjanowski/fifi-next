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
    const { to, subject, text } = await req.json();
    try {
        await transporter.sendMail({
            from: 'filiptryjanowki5@gmail.com', 
            to: 'bogdan.bon3r80@gmail.com',
            subject,
            text,
        });
        return NextResponse.json({ success: true, message: "E-mail wysłany!" });
    } catch (err: any) {
        console.error("Błąd wysyłki e-maila:", err);
        return NextResponse.json({ success: false, message: "Błąd wysyłki e-maila" }, { status: 500 });
    }
} 