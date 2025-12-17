import fs from 'fs';
import path from 'path';
import { emailService } from './EmailService';

export class NotificationService {
    private templatesDir: string;

    constructor() {
        this.templatesDir = path.join(process.cwd(), 'src', 'templates');
    }

    private async loadTemplate(templateId: string): Promise<string> {
        const templatePath = path.join(this.templatesDir, `${templateId}.html`);
        try {
            return fs.promises.readFile(templatePath, 'utf-8');
        } catch (error) {
            console.error(`Failed to load template ${templateId}: `, error);
            throw new Error(`Template ${templateId} not found`);
        }
    }

    private replacePlaceholders(template: string, data: Record<string, any>): string {
        return template.replace(/{{(\w+)}}/g, (_, key) => {
            return data[key] !== undefined ? String(data[key]) : `{ {${key} } } `;
        });
    }

    async sendEmail(to: string, subject: string, templateId: string, data: Record<string, any>): Promise<void> {
        console.log(`[NotificationService] Preparing to send email to ${to} with subject "${subject}"...`);

        try {
            const templateContent = await this.loadTemplate(templateId);
            const htmlBody = this.replacePlaceholders(templateContent, data);

            await emailService.sendMail(to, subject, htmlBody);

        } catch (error) {
            console.error('[NotificationService] Failed to process notification:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();
