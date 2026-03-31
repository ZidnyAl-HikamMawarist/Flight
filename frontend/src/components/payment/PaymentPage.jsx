import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Building2, Wallet, CheckCircle, ArrowLeft, Clock, Shield, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { theme, ui } from '../../theme';
import { useToast } from '../ui/ToastNotification';
import useIsMobile from '../../hooks/useIsMobile';

const PAYMENT_METHODS = [
    {
        key: 'bank_transfer',
        label: 'Transfer Bank',
        icon: <Building2 size={22} />,
        description: 'BCA, Mandiri, BNI, BRI',
        color: '#0194f3',
        bg: '#eff6ff',
    },
    {
        key: 'credit_card',
        label: 'Kartu Kredit/Debit',
        icon: <CreditCard size={22} />,
        description: 'Visa, Mastercard, JCB',
        color: '#7c3aed',
        bg: '#faf5ff',
    },
    {
        key: 'e_wallet',
        label: 'Dompet Digital',
        icon: <Wallet size={22} />,
        description: 'GoPay, OVO, DANA, ShopeePay',
        color: '#059669',
        bg: '#f0fdf4',
    },
];

// Konfetti animation
const Confetti = () => {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.8,
        color: ['#0194f3', '#7c3aed', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 6,
    }));

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
            {pieces.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
                    animate={{ y: window.innerHeight + 40, x: (Math.random() - 0.5) * 300, opacity: 0, rotate: Math.random() * 720 }}
                    transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
                    style={{
                        position: 'absolute',
                        left: p.left,
                        top: 0,
                        width: p.size,
                        height: p.size,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        background: p.color,
                    }}
                />
            ))}
        </div>
    );
};

const PaymentPage = ({ bookings, flight, totalAmount, onBack, onSuccess }) => {
    // bookings: array of { bookingId, seatId, passengerName }
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [step, setStep] = useState('choose'); // 'choose' | 'processing' | 'success'
    const [countdown, setCountdown] = useState(15 * 60); // 15 menit dalam detik
    const [showConfetti, setShowConfetti] = useState(false);
    const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const timerRef = useRef(null);

    // Countdown timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handlePay = async () => {
        if (!selectedMethod) return;
        setStep('processing');

        try {
            // Update all bookings to paid
            await Promise.all(
                bookings.map(b =>
                    axios.post(`http://localhost:3333/api/bookings/${b.bookingId}/pay`, {
                        paymentMethod: selectedMethod
                    })
                )
            );

            toast('Pembayaran berhasil dikonfirmasi! 🎉', 'success');
            // Short delay for dramatic effect
            await new Promise(r => setTimeout(r, 1800));

            clearInterval(timerRef.current);
            setShowConfetti(true);
            setStep('success');
            setTimeout(() => setShowConfetti(false), 3000);
        } catch (err) {
            toast('Pembayaran gagal: ' + (err.response?.data?.message || err.message), 'error');
            setStep('choose');
        }
    };

    if (step === 'success') {
        return (
            <div style={styles.container}>
                {showConfetti && <Confetti />}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{
                        ...styles.successCard,
                        maxWidth: isMobile ? '100%' : 440,
                        borderRadius: isMobile ? 0 : 24,
                        padding: isMobile ? '32px 20px' : 40,
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    >
                        <CheckCircle size={80} color="#10b981" strokeWidth={1.5} />
                    </motion.div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '16px 0 8px' }}>Pembayaran Berhasil! 🎉</h2>
                    <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>
                        Tiket Anda telah dikonfirmasi. Selamat terbang!
                    </p>

                    <div style={styles.successDetails}>
                        <div style={styles.successRow}>
                            <span>Total Dibayar</span>
                            <strong style={{ color: '#10b981', fontSize: 18 }}>Rp {(totalAmount ? parseInt(totalAmount) : 850000).toLocaleString('id-ID')}</strong>
                        </div>
                        <div style={styles.successRow}>
                            <span>Metode</span>
                            <strong>{PAYMENT_METHODS.find(m => m.key === selectedMethod)?.label}</strong>
                        </div>
                        <div style={styles.successRow}>
                            <span>Penerbangan</span>
                            <strong>{flight?.flightCall}</strong>
                        </div>
                        <div style={styles.successRow}>
                            <span>Kursi</span>
                            <strong>{bookings?.map(b => b.seatId).join(', ')}</strong>
                        </div>
                    </div>

                    <button
                        onClick={onSuccess}
                        style={{ ...ui.button.primary, width: '100%', padding: '14px', marginTop: 4 }}
                    >
                        Lihat E-Ticket
                    </button>
                </motion.div>
            </div>
        );
    }

    if (step === 'processing') {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid #e2e8f0', borderTop: '4px solid #0194f3' }}
                />
                <p style={{ marginTop: 20, fontWeight: 700, color: '#475569', fontSize: 16 }}>Memproses pembayaran...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    ...styles.mainCard,
                    maxWidth: isMobile ? '100%' : 560,
                    borderRadius: isMobile ? 0 : 24,
                    minHeight: isMobile ? '100vh' : 'auto',
                }}
            >
                {/* Header */}
                <div style={styles.header}>
                    <button onClick={onBack} style={styles.backBtn}>
                        <ArrowLeft size={18} /> Kembali
                    </button>
                    <h2 style={styles.title}>Pembayaran</h2>
                    {/* Countdown */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: countdown < 120 ? '#ef4444' : '#64748b',
                        fontWeight: 700, fontSize: 15,
                        background: countdown < 120 ? '#fff1f2' : '#f8fafc',
                        padding: '6px 14px', borderRadius: 999,
                        border: `1px solid ${countdown < 120 ? '#fecdd3' : '#e2e8f0'}`,
                    }}>
                        <Clock size={15} /> {formatTime(countdown)}
                    </div>
                </div>

                {/* Order Summary */}
                <div style={styles.summary}>
                    <div style={styles.summaryTitle}>Ringkasan Pesanan</div>
                    <div style={styles.summaryFlight}>
                        <span style={{ fontWeight: 800, fontSize: 16 }}>{flight?.flightCall}</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>
                            {flight?.schedule?.originAirport?.city} → {flight?.schedule?.destinationAirport?.city}
                        </span>
                    </div>
                    <div style={styles.summarySeats}>
                        {bookings?.map(b => (
                            <span key={b.bookingId} style={styles.seatPill}>
                                Kursi {b.seatId}
                            </span>
                        ))}
                    </div>
                    <div style={styles.summaryTotal}>
                        <span style={{ color: '#64748b' }}>Total Pembayaran</span>
                        <strong style={{ fontSize: 22, color: '#0194f3' }}>
                            Rp {(totalAmount ? parseInt(totalAmount) : 850000).toLocaleString('id-ID')}
                        </strong>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={styles.methodSection}>
                    <div style={styles.sectionLabel}><Shield size={15} /> Pilih Metode Pembayaran</div>
                    <div style={styles.methodGrid}>
                        {PAYMENT_METHODS.map(method => (
                            <motion.div
                                key={method.key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedMethod(method.key)}
                                style={{
                                    ...styles.methodCard,
                                    border: selectedMethod === method.key
                                        ? `2px solid ${method.color}`
                                        : '2px solid #e2e8f0',
                                    background: selectedMethod === method.key ? method.bg : '#fff',
                                }}
                            >
                                <div style={{ color: method.color }}>{method.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{method.label}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{method.description}</div>
                                </div>
                                {selectedMethod === method.key && (
                                    <CheckCircle size={18} color={method.color} style={{ marginLeft: 'auto' }} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Credit card form if selected */}
                <AnimatePresence>
                    {selectedMethod === 'credit_card' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', padding: '0 28px' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={styles.cardPreview}>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>NOMOR KARTU</div>
                                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 3, margin: '8px 0' }}>
                                        {cardDetails.number || '•••• •••• •••• ••••'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                                        <span>{cardDetails.name || 'NAMA PEMEGANG'}</span>
                                        <span>{cardDetails.expiry || 'MM/YY'}</span>
                                    </div>
                                </div>
                                <input style={styles.cardInput} placeholder="Nama Pemegang Kartu"
                                    value={cardDetails.name} onChange={e => setCardDetails(p => ({ ...p, name: e.target.value }))} />
                                <input style={styles.cardInput} placeholder="Nomor Kartu (16 digit)"
                                    maxLength={19} value={cardDetails.number}
                                    onChange={e => {
                                        let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        v = v.replace(/(.{4})/g, '$1 ').trim();
                                        setCardDetails(p => ({ ...p, number: v }));
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input style={{ ...styles.cardInput, flex: 1 }} placeholder="MM/YY"
                                        maxLength={5} value={cardDetails.expiry}
                                        onChange={e => {
                                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                            setCardDetails(p => ({ ...p, expiry: v }));
                                        }}
                                    />
                                    <input style={{ ...styles.cardInput, flex: 1 }} placeholder="CVV"
                                        maxLength={3} type="password" value={cardDetails.cvv}
                                        onChange={e => setCardDetails(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pay Button */}
                <div style={{ padding: '20px 28px 28px' }}>
                    <button
                        onClick={handlePay}
                        disabled={!selectedMethod || countdown === 0}
                        style={{
                            ...ui.button.primary,
                            width: '100%',
                            padding: '16px',
                            fontSize: 16,
                            fontWeight: 800,
                            opacity: (!selectedMethod || countdown === 0) ? 0.6 : 1,
                            cursor: (!selectedMethod || countdown === 0) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <Sparkles size={18} />
                        Bayar Sekarang — Rp {(totalAmount ? parseInt(totalAmount) : 850000).toLocaleString('id-ID')}
                    </button>
                    {countdown === 0 && (
                        <p style={{ textAlign: 'center', color: '#ef4444', marginTop: 10, fontSize: 13, fontWeight: 700 }}>
                            Waktu pembayaran habis. Silakan booking ulang.
                        </p>
                    )}
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Shield size={12} /> Pembayaran diproses secara aman dan terenkripsi
                    </p>
                </div>
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
        padding: '40px 20px',
        fontFamily: theme.fonts.primary,
    },
    mainCard: {
        width: '100%',
        maxWidth: 560,
        background: '#fff',
        borderRadius: 24,
        boxShadow: theme.shadows['2xl'],
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '20px 28px',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', color: '#64748b',
        cursor: 'pointer', fontWeight: 600, fontSize: 14,
    },
    title: {
        fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, flex: 1,
    },
    summary: {
        padding: '20px 28px',
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderBottom: `1px solid #bae6fd`,
    },
    summaryTitle: { fontSize: 11, fontWeight: 800, color: '#0194f3', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
    summaryFlight: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 },
    summarySeats: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    seatPill: {
        background: '#fff', border: '1px solid #bae6fd',
        borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#0369a1',
    },
    summaryTotal: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    methodSection: { padding: '20px 28px' },
    sectionLabel: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontWeight: 800, fontSize: 13, color: '#64748b', marginBottom: 14,
    },
    methodGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
    methodCard: {
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 14,
        cursor: 'pointer', transition: 'all 0.15s',
    },
    successCard: {
        width: '100%', maxWidth: 440,
        background: '#fff', borderRadius: 24,
        boxShadow: theme.shadows['2xl'],
        padding: 40, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    successDetails: {
        width: '100%',
        background: '#f8fafc', borderRadius: 14,
        border: `1px solid ${theme.colors.border}`,
        padding: '14px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        marginBottom: 20,
    },
    successRow: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: 14, color: '#64748b',
    },
    cardPreview: {
        background: 'linear-gradient(135deg, #0ea5e9, #2563eb, #7c3aed)',
        borderRadius: 16, padding: '20px 22px',
        marginBottom: 4,
    },
    cardInput: { ...ui.input.base },
};

export default PaymentPage;
