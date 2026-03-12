import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
    google: services.google({
        clientId: env.get('GOOGLE_CLIENT_ID')!,
        clientSecret: env.get('GOOGLE_CLIENT_SECRET')!,
        callbackUrl: env.get('GOOGLE_CALLBACK_URL')!,
    }),
    /* apple: services.apple({
        clientId: env.get('APPLE_CLIENT_ID')!,
        clientSecret: env.get('APPLE_CLIENT_SECRET')!,
        callbackUrl: env.get('APPLE_CALLBACK_URL')!,
        keyId: env.get('APPLE_KEY_ID')!,
        teamId: env.get('APPLE_TEAM_ID')!,
        privateKey: env.get('APPLE_PRIVATE_KEY_PATH')!,
    }), */
})

export default allyConfig

declare module '@adonisjs/ally/types' {
    interface SocialProviders extends InferSocialProviders<typeof allyConfig> { }
}
