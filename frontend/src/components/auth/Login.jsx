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
        if (!email || !password) {
            return toast('Email dan password harus diisi', 'error');
        }

        try {
            const res = await axios.post(`http://${window.location.hostname}:3333/api/auth/login`, { email, password });
            const token = res.data.token.token;
            localStorage.setItem('token', token);
            toast('Selamat datang kembali! ✈️', 'success');
            await onLoginSuccess(token);
        } catch (err) {
            const pesanError = err.response?.data?.message || 'Email atau Password salah';
            toast('Login Gagal: ' + pesanError, 'error');
        }
    };

    return (
        <div style={styles.container}>
            {/* Background accents */}
            <div aria-hidden style={styles.accents}>
                <div style={styles.blobLeft} />
                <div style={styles.blobRight} />
                <div style={styles.glow} />
            </div>

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

                {/* SSO Section */}
                <div style={styles.divider}>
                    <div style={styles.line}></div>
                    <span style={styles.dividerText}>atau masuk dengan</span>
                    <div style={styles.line}></div>
                </div>

                <div style={styles.ssoGroup}>
                    <button
                        type="button"
                        onClick={() => window.location.href = `http://${window.location.hostname}:3333/api/auth/social/google/redirect`}
                        style={{ ...styles.ssoBtn, borderColor: '#ea4335' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                        </svg>
                        Masuk dengan Google
                    </button>
                </div>

                {/* Registration link hidden - code preserved for future */}
                {/* 
                <p style={styles.footerText}>
                    Belum punya akun? <span onClick={onSwitch} style={{ ...styles.link, cursor: 'pointer', marginLeft: '5px' }}>Daftar Disini</span>
                </p>
                */}

                <div style={styles.backToLanding} onClick={() => window.location.reload()}>
                    <span style={styles.landingLink}>Kembali ke Beranda</span>
                </div>
            </div>
        </div>
    );
};

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
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        margin: '25px 0'
    },
    line: {
        flex: 1,
        height: '1px',
        background: 'rgba(0,0,0,0.08)'
    },
    dividerText: {
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    ssoGroup: {
        display: 'flex',
        gap: '12px'
    },
    ssoBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px',
        borderRadius: theme.radius.md,
        border: '1.5px solid #e2e8f0',
        background: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        color: theme.colors.text,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            background: '#f8fafc',
            transform: 'translateY(-2px)'
        }
    },
    footerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: theme.colors.textMuted },
    link: { color: theme.colors.primary, textDecoration: 'none', fontWeight: '700' },
    backToLanding: { textAlign: 'center', marginTop: '25px', cursor: 'pointer' },
    landingLink: { color: theme.colors.textMuted, textDecoration: 'none', fontWeight: '600', fontSize: '13px' }
};

export default Login;