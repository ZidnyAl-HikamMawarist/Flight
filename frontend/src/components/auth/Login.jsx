import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Plane } from 'lucide-react';
import axios from 'axios';
import { theme, ui } from '../../theme';
import { useToast } from '../ui/ToastNotification';

const tokens = {
    hero: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #7c3aed 100%)',
    glass: 'rgba(255,255,255,0.92)',
    glassBorder: 'rgba(255,255,255,0.55)'
}

const Login = ({ onSwitch, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validasi simpel sebelum tembak API
        if (!email || !password) {
            return toast('Email dan password harus diisi', 'error');
        }

        try {
            console.log("Mencoba login untuk:", email);
            const res = await axios.post('http://localhost:3333/api/auth/login', { email, password });

            const token = res.data.token.token;
            localStorage.setItem('token', token);

            // Munculkan toast sukses
            toast('Selamat datang kembali! ✈️', 'success');

            // Tunggu data user
            await onLoginSuccess(token);
        } catch (err) {
            console.error("Login detail error:", err.response?.data);

            // Ganti alert dengan toast error
            const pesanError = err.response?.data?.message || 'Email atau Password salah';
            toast('Login Gagal: ' + pesanError, 'error');
        }
    };

    return (
        <div style={styles.container}>
            {/* ... bagian style accents & card tetap sama ... */}
            <div style={styles.card}>
                <div style={styles.header}>
                    <Plane size={40} color="#0194f3" />
                    <h2 style={styles.title}>Selamat Datang Kembali</h2>
                    <p style={styles.subtitle}>Masuk untuk lanjut pesan penerbangan Anda</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <Mail style={styles.icon} size={20} />
                        <input
                            type="email"
                            placeholder="Email Anda"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <Lock style={styles.icon} size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        Masuk Sekarang <ArrowRight size={18} />
                    </button>
                </form>

                <p style={styles.footerText}>
                    Belum punya akun? <span onClick={onSwitch} style={{ ...styles.link, cursor: 'pointer', marginLeft: '5px' }}>Daftar Disini</span>
                </p>
                {/* ... bagian footer lainnya ... */}
            </div>
        </div>
    );
};


// Style sederhana biar rapi dulu (nanti bisa pindah ke CSS)
const styles = {
    container: {
        ...ui.page,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: tokens.hero,
        position: 'relative',
        overflow: 'hidden',
        padding: theme.spacing['2xl']
    },
    accents: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.95
    },
    blobLeft: {
        position: 'absolute',
        width: 520,
        height: 520,
        left: -180,
        top: -220,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        filter: 'blur(2px)'
    },
    blobRight: {
        position: 'absolute',
        width: 640,
        height: 640,
        right: -280,
        bottom: -340,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.14)',
        filter: 'blur(2px)'
    },
    glow: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.20), transparent 45%), radial-gradient(circle at 82% 65%, rgba(255,255,255,0.12), transparent 50%)'
    },
    card: {
        ...ui.card.base,
        padding: '36px',
        width: '90%',
        maxWidth: '420px',
        borderRadius: theme.radius['2xl'],
        backgroundColor: tokens.glass,
        border: `1px solid ${tokens.glassBorder}`,
        boxShadow: theme.shadows['2xl'],
        position: 'relative',
        zIndex: 1
    },
    header: { textAlign: 'center', marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: '800', color: theme.colors.text, margin: '10px 0 5px' },
    subtitle: { color: theme.colors.textMuted, fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
    icon: { position: 'absolute', left: '12px', color: '#9aa3b2' },
    input: { ...ui.input.base, paddingLeft: '42px', width: '100%', boxSizing: 'border-box' },
    button: { ...ui.button.primary, marginTop: '10px', justifyContent: 'center' },
    footerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: theme.colors.textMuted },
    link: { color: theme.colors.primary, textDecoration: 'none', fontWeight: '700' },
    backToLanding: { textAlign: 'center', marginTop: '15px' },
    landingLink: { color: theme.colors.textMuted, textDecoration: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }
};

export default Login;