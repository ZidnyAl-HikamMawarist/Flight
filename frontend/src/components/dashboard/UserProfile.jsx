import React, { useState } from 'react';
import { User, Lock, Phone, Mail, Save, ArrowLeft, CheckCircle, Camera, Shield } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { theme, ui } from '../../theme';
import { useToast } from '../ui/ToastNotification';
import useIsMobile from '../../hooks/useIsMobile';

const UserProfile = ({ user, token, onBack, onUserUpdate }) => {
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccess(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        if (activeTab === 'security') {
            if (form.password !== form.confirmPassword) {
                return setError('Konfirmasi password tidak cocok!');
            }
            if (form.password && form.password.length < 8) {
                return setError('Password minimal 8 karakter!');
            }
        }

        setLoading(true);
        try {
            const payload = {};
            if (activeTab === 'profile') {
                payload.fullName = form.fullName;
                payload.phone = form.phone;
            } else {
                if (!form.password) return setError('Masukkan password baru!');
                payload.password = form.password;
            }

            const res = await axios.put('http://localhost:3333/api/auth/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast('Profil berhasil diperbarui! 👤', 'success');

            setSuccess(true);
            if (onUserUpdate) onUserUpdate(res.data.user);
            if (activeTab === 'security') {
                setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (err) {
            toast(err.response?.data?.message || 'Gagal menyimpan perubahan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const avatarInitials = (user?.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    ...styles.card,
                    maxWidth: isMobile ? '100%' : 520,
                    borderRadius: isMobile ? 0 : 24,
                    minHeight: isMobile ? '100vh' : 'auto',
                }}
            >
                {/* Header */}
                <div style={styles.header}>
                    <button onClick={onBack} style={styles.backBtn}>
                        <ArrowLeft size={18} /> Kembali
                    </button>
                    <h2 style={styles.title}>Profil Saya</h2>
                </div>

                {/* Avatar Section */}
                <div style={styles.avatarSection}>
                    <div style={styles.avatarCircle}>
                        <span style={styles.avatarText}>{avatarInitials}</span>
                        <div style={styles.avatarBadge}><Camera size={14} /></div>
                    </div>
                    <div>
                        <div style={styles.userName}>{user?.fullName}</div>
                        <div style={styles.userEmail}>{user?.email}</div>
                        <div style={styles.userRole}>{user?.role === 'admin' ? '🛡 Admin' : '✈ Penumpang'}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {[
                        { key: 'profile', icon: <User size={16} />, label: 'Informasi Pribadi' },
                        { key: 'security', icon: <Shield size={16} />, label: 'Keamanan' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSuccess(false); setError(''); }}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.key ? styles.tabActive : {})
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSave} style={styles.form}>
                    {activeTab === 'profile' && (
                        <>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}><User size={14} /> Nama Lengkap</label>
                                <input
                                    style={styles.input}
                                    value={form.fullName}
                                    onChange={e => handleChange('fullName', e.target.value)}
                                    placeholder="Nama lengkap Anda"
                                />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}><Mail size={14} /> Email</label>
                                <input
                                    style={{ ...styles.input, background: '#f8fafc', cursor: 'not-allowed' }}
                                    value={user?.email || ''}
                                    disabled
                                />
                                <p style={styles.hint}>Email tidak dapat diubah</p>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}><Phone size={14} /> Nomor Telepon</label>
                                <input
                                    style={styles.input}
                                    value={form.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <>
                            <div style={styles.securityNote}>
                                <Lock size={16} color="#0194f3" />
                                <span>Masukkan password baru Anda. Minimal 8 karakter.</span>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}><Lock size={14} /> Password Baru</label>
                                <input
                                    type="password"
                                    style={styles.input}
                                    value={form.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    placeholder="Masukkan password baru"
                                />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}><Lock size={14} /> Konfirmasi Password</label>
                                <input
                                    type="password"
                                    style={styles.input}
                                    value={form.confirmPassword}
                                    onChange={e => handleChange('confirmPassword', e.target.value)}
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                        </>
                    )}

                    {/* Status messages */}
                    {error && (
                        <div style={styles.errorBox}>{error}</div>
                    )}
                    {success && (
                        <div style={styles.successBox}>
                            <CheckCircle size={16} /> Perubahan berhasil disimpan!
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{ ...ui.button.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: theme.colors.background,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 20px',
        fontFamily: theme.fonts.primary,
    },
    card: {
        width: '100%',
        maxWidth: 520,
        background: '#fff',
        borderRadius: 24,
        boxShadow: theme.shadows['2xl'],
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '24px 28px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', color: theme.colors.textMuted,
        cursor: 'pointer', fontWeight: 600, fontSize: 14,
    },
    title: {
        fontSize: 22, fontWeight: 800, color: theme.colors.text, margin: 0,
    },
    avatarSection: {
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    avatarCircle: {
        width: 72, height: 72,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 14px rgba(1,148,243,0.35)',
        flexShrink: 0,
    },
    avatarText: {
        color: '#fff', fontWeight: 900, fontSize: 26, letterSpacing: -1,
    },
    avatarBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 24, height: 24, borderRadius: '50%',
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)', cursor: 'pointer',
        color: '#0194f3',
    },
    userName: { fontSize: 18, fontWeight: 800, color: '#0f172a' },
    userEmail: { fontSize: 14, color: '#64748b', marginTop: 2 },
    userRole: { fontSize: 12, fontWeight: 700, color: '#0194f3', marginTop: 6 },
    tabs: {
        display: 'flex',
        padding: '16px 28px 0',
        gap: 8,
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    tab: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 18px',
        borderRadius: '10px 10px 0 0',
        border: 'none',
        background: 'transparent',
        color: theme.colors.textMuted,
        fontWeight: 700, fontSize: 13,
        cursor: 'pointer',
        borderBottom: '3px solid transparent',
        transition: 'all 0.15s',
    },
    tabActive: {
        color: '#0194f3',
        borderBottom: '3px solid #0194f3',
        background: '#f0f9ff',
    },
    form: {
        display: 'flex', flexDirection: 'column', gap: 18,
        padding: 28,
    },
    fieldGroup: {
        display: 'flex', flexDirection: 'column', gap: 7,
    },
    label: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 700, color: '#64748b',
    },
    input: { ...ui.input.base },
    hint: { fontSize: 11, color: '#94a3b8', margin: '2px 0 0', },
    securityNote: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 13, color: '#1d4ed8',
    },
    errorBox: {
        background: '#fff1f2', border: '1px solid #fecdd3',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 13, color: '#e11d48', fontWeight: 600,
    },
    successBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 13, color: '#15803d', fontWeight: 600,
    },
};

export default UserProfile;
