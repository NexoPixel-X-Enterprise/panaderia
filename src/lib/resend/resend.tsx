'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

export async function sendEmail({ nombre, email, asunto, mensaje }: SendEmailProps) {
  try {
    if (!nombre || !email || !asunto || !mensaje) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }

  
    const data = await resend.emails.send({
      from: 'NexoPixel X Contacto <onboarding@resend.dev>', 
      to: ['nexopixelx@gmail.com'], 
      subject: `Nuevo mensaje de la Web: ${asunto}`,
      html: `
        <h2>¡Tienes un nuevo mensaje de contacto de NexoPixel X!</h2>
        <p><strong>Nombre del cliente:</strong> ${nombre}</p>
        <p><strong>Email de contacto:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <hr />
        <p><strong>Mensaje escrito:</strong></p>
        <p style="background-color: #120e2e; color: white; padding: 15px; border-radius: 8px; border: 1px solid #2b71ff;">
          ${mensaje}
        </p>
      `,
    });

    return { success: true, data };

  } catch (error: any) {
    console.error("Error en el servidor de Resend:", error);
    return { success: false, error: error.message || 'Error interno del servidor' };
  }
}