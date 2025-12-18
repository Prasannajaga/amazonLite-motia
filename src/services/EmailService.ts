import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendMail(to: string, subject: string, html: string): Promise<void> {
        try {
            const account = await nodemailer.createTestAccount();
            const testTransporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass,
                },
            });

            const info = await testTransporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@amzLite.com',
                to: to,
                subject: subject,
                html: html,
            });

            console.log('Test account details:', nodemailer.getTestMessageUrl(info));

            console.log(`[EmailService] Message sent: ${info.messageId}`);
        } catch (error) {
            console.error('[EmailService] Failed to send email:', error);
            throw error;
        }
    }
}

export const emailService = new EmailService();
