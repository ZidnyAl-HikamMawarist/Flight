import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
    default: 'smtp',
    from: {
        address: env.get('FROM_EMAIL') || 'no-reply@flight.com',
        name: 'My Flight Booking',
    },
    replyTo: {
        address: env.get('FROM_EMAIL') || 'no-reply@flight.com',
        name: 'My Flight Booking',
    },
    mailers: {
        smtp: transports.smtp({
            host: env.get('SMTP_HOST') || 'sandbox.smtp.mailtrap.io',
            port: env.get('SMTP_PORT') || 2525,
            secure: false,
            auth: {
                type: 'login',
                user: env.get('SMTP_USERNAME') || '',
                pass: env.get('SMTP_PASSWORD') || '',
            },
        }),
    },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
    export interface MailersList extends InferMailers<typeof mailConfig> { }
}
