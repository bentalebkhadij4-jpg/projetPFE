import nodemailer from 'nodemailer';

let transporter = null;

export async function initializeEmail() {
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  console.log(' Email service initialized');
}

export const emailService = {
  async sendEmployeeNotification(employeeEmail, employeeName, citizenName, subject, serviceType) {
    if (!transporter) await initializeEmail();
    
    const info = await transporter.sendMail({
      from: '"Baladiya Digital" <noreply@baladiya.dz>',
      to: employeeEmail,
      subject: `Nouvelle demande: ${subject}`,
      html: `
        <h2>Bonjour ${employeeName},</h2>
        <p>Une nouvelle demande a été assignée à votre service.</p>
        <ul>
          <li><strong>Citoyen:</strong> ${citizenName}</li>
          <li><strong>Sujet:</strong> ${subject}</li>
          <li><strong>Service:</strong> ${serviceType}</li>
        </ul>
      `
    });
    
    console.log(' Email sent to employee:', info.messageId);
    return info;
  },
  
  async sendValidationEmailWithPDF(citizenEmail, citizenFirstName, requestSubject, status, employeeName, comment, pdfBuffer) {
    if (!transporter) await initializeEmail();
    
    const statusText = status === 'completed' ? 'approuvée' : 'rejetée';
    const statusColor = status === 'completed' ? '#059669' : '#dc2626';
    
    const info = await transporter.sendMail({
      from: '"Baladiya Digital" <noreply@baladiya.dz>',
      to: citizenEmail,
      subject: `Votre demande a été ${statusText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #1e40af;">Bonjour ${citizenFirstName},</h2>
          <p>Votre demande "${requestSubject}" a été <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Traité par:</strong> ${employeeName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            ${comment ? `<p><strong>Commentaire:</strong> ${comment}</p>` : ''}
          </div>
          <p>PDF ci-joint.</p>
        </div>
      `,
      attachments: [
        {
          filename: `demande-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    
    console.log('Email with PDF sent:', info.messageId);
    return info;
  }
};

export { transporter };