import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
    async run() {
        // Hapus semua user lama
        await User.query().delete()

        // Buat akun user biasa
        await User.create({
            fullName: 'Zidni',
            email: 'zidni@flight.com',
            password: '12345678',
            role: 'user',
        })

        // Buat akun admin
        await User.create({
            fullName: 'Administrator',
            email: 'admin@flight.com',
            password: 'admin123',
            role: 'admin',
        })
    }
}
