import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { notificationService } from '../services/NotificationService'

export const config: EventConfig = {
  type: 'event',
  name: 'NotifyUser',
  description: 'Handles sending email notifications to users using dynamic templates',
  flows: ['Auth'],
  subscribes: ['send-notification'],
  emits: [],
  input: z.object({
    email: z.string(),
    subject: z.string(),
    templateId: z.string(),
    templateData: z.record(z.any(), z.any()),
  })
}

export const handler: Handlers['NotifyUser'] = async (input, { traceId, logger }) => {
  logger.info('Processing notification event', { email: input.email, templateId: input.templateId, traceId })

  try {
    await notificationService.sendEmail(
      input.email,
      input.subject,
      input.templateId,
      input.templateData
    );

    logger.info('Notification sent successfully', { email: input.email })
  } catch (error: any) {
    logger.error('Failed to send notification', { error: error.message })
    throw error
  }
}
