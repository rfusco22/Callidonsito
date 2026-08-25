import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { fullName, phone, mail, conversation } = await req.json();

    if (!fullName || !phone || !mail) {
return Response.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background: #F39C12; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Lead - Callidon</h1>
          </div>
          <div style="padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Name</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Phone</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">${mail}</td>
              </tr>
            </table>

            <h2 style="color: #333; font-size: 16px; margin-top: 20px;">Conversation</h2>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 13px; color: #555; line-height: 1.6;">
              ${(conversation || 'No conversation').replace(/\n/g, '<br>')}
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
              This lead was generated automatically by the Callidon chatbot.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'fuscoriccardo11@gmail.com',
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Callidon" <${process.env.SMTP_USER || 'noreply@callidonsito.com'}>`,
      to: process.env.OWNER_EMAIL || 'fuscoriccardo11@gmail.com',
      subject: `New Lead - ${fullName} - Callidon`,
      html: htmlContent,
    });

    return Response.json({ success: true, message: 'Lead sent via email successfully' });
  } catch (error) {
    console.error('[v0] Error sending lead email:', error);
    return Response.json(
      { error: 'Error sending email' },
      { status: 500 }
    );
  }
}
