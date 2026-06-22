import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      // Si no hay API key, simulamos el envío para pruebas
      console.log('--- MOCK EMAIL ---');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Html:', html);
      return NextResponse.json({ success: true, mock: true, message: 'Email simulado (Falta RESEND_API_KEY en Vercel)' });
    }

    const data = await resend.emails.send({
      from: 'GestionPro <citas@gestionpro.pe>',
      to: [to],
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
