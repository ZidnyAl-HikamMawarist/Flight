import React, { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, Ticket, ChevronLeft, Star, CreditCard, Mail } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BookingDetail from './BookingDetail'
import { theme, ui } from '../../theme'
import ReviewForm from '../reviews/ReviewForm';

const BookingHistory = ({ user, onBack }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showReviewFor, setShowReviewFor] = useState(null); // { flightCall, bookingId }

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/bookings/history', {
                params: { email: user?.email }
            });
            setBookings(res.data);
        } catch (err) {
            console.error("Gagal ambil riwayat:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const showDetail = async (bookingId) => {
        setDetailLoading(true)
        try {
            const res = await axios.get(`http://localhost:3333/api/bookings/${bookingId}`)
            const data = res.data
            // attach callback so modal can notify to refresh list
            data._onDeleted = fetchBookings
            setSelectedBooking(data)
        } catch (err) {
            console.error('Gagal ambil detail booking', err)
            alert('Gagal ambil detail booking')
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => setSelectedBooking(null);

    const token = localStorage.getItem('token');

    const statusColors = {
        'Scheduled': { bg: '#e3f2fd', color: '#1565c0' },
        'Departed': { bg: '#fff3e0', color: '#e65100' },
        'Arrived': { bg: '#e8f5e9', color: '#2e7d32' },
        'Delayed': { bg: '#fce4ec', color: '#c62828' },
        'Cancelled': { bg: '#efebe9', color: '#4e342e' },
    };

    return (
        <div style={styles.container}>
            <button onClick={onBack} style={styles.backLink}>
                <ChevronLeft size={18} /> Kembali ke Pencarian
            </button>

            <div style={styles.header}>
                <Ticket size={28} color="#0194f3" />
                <h2 style={styles.title}>Riwayat Pemesanan</h2>
            </div>

            {loading ? (
                <div style={styles.loadingBox}>Memuat data...</div>
            ) : bookings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.emptyState}
                >
                    <Plane size={60} color="#ddd" />
                    <h3 style={{ margin: '15px 0 5px', color: '#999' }}>Belum Ada Pesanan</h3>
                    <p style={{ color: '#bbb', fontSize: '14px' }}>Cari dan pesan tiket penerbangan pertama Anda!</p>
                </motion.div>
            ) : (
                <div style={styles.bookingList}>
                    {bookings.map((booking, idx) => {
                        const flight = booking.flight;
                        const schedule = flight?.schedule;
                        const origin = schedule?.originAirport;
                        const dest = schedule?.destinationAirport;
                        const status = flight?.status;
                        const sc = statusColors[status?.name] || statusColors['Scheduled'];

                        return (
                            <motion.div
                                key={booking.bookingId}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                style={styles.card}
                                onClick={() => showDetail(booking.bookingId)}
                            >
                                {/* Top Bar */}
                                <div style={styles.cardTop}>
                                    <div style={styles.flightInfo}>
                                        <div style={styles.planeIcon}><Plane size={18} color="#fff" /></div>
                                        <div>
                                            <div style={styles.flightCall}>{flight?.flightCall}</div>
                                            <div style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                                                {status?.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.bookingId}>
                                        <span style={styles.bookingIdLabel}>Booking ID</span>
                                        <span style={styles.bookingIdValue}>#{booking.bookingId}</span>
                                    </div>
                                </div>

                                {/* Route */}
                                <div style={styles.routeSection}>
                                    <div style={styles.routePoint}>
                                        <div style={styles.airportCode}>{origin?.iataAirportCode}</div>
                                        <div style={styles.cityName}>{origin?.city}</div>
                                        <div style={styles.timeLabel}>
                                            <Clock size={12} /> {formatTime(schedule?.departureTimeGmt)}
                                        </div>
                                    </div>

                                    <div style={styles.routeLine}>
                                        <div style={styles.dashedLine}></div>
                                        <Plane size={16} color="#0194f3" style={{ transform: 'rotate(90deg)' }} />
                                        <div style={styles.dashedLine}></div>
                                    </div>

                                    <div style={styles.routePoint}>
                                        <div style={styles.airportCode}>{dest?.iataAirportCode}</div>
                                        <div style={styles.cityName}>{dest?.city}</div>
                                        <div style={styles.timeLabel}>
                                            <Clock size={12} /> {formatTime(schedule?.arrivalTimeGmt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={styles.cardFooter}>
                                    <div style={styles.footerItem}>
                                        <MapPin size={14} color="#999" />
                                        <span>Kursi: <strong>{booking.seatId}</strong></span>
                                    </div>
                                    <div style={styles.footerItem}>
                                        <Clock size={14} color="#999" />
                                        <span>Dipesan: {formatDate(booking.createdAt)}</span>
                                    </div>
                                    {/* Payment Status badge */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                                        background: booking.paymentStatus === 'paid' ? '#d1fae5' : '#fef9c3',
                                        color: booking.paymentStatus === 'paid' ? '#065f46' : '#92400e',
                                        border: `1px solid ${booking.paymentStatus === 'paid' ? '#6ee7b7' : '#fde68a'}`,
                                    }}>
                                        <CreditCard size={12} />
                                        {booking.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                    </div>

                                    {/* Ticket Actions */}
                                    {booking.paymentStatus === 'paid' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`http://localhost:3333/api/bookings/${booking.bookingId}/pdf`, '_blank');
                                                }}
                                                style={{ ...styles.actionBtn, background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}
                                                title="Download PDF"
                                            >
                                                <Ticket size={14} /> PDF
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await axios.post(`http://localhost:3333/api/bookings/${booking.bookingId}/send-email`);
                                                        alert('Tiket sedang dikirim ke email Anda! 📧');
                                                    } catch (err) {
                                                        alert('Gagal mengirim email. Silakan coba lagi.');
                                                    }
                                                }}
                                                style={{ ...styles.actionBtn, background: '#f5f3ff', color: '#5b21b6', borderColor: '#ddd6fe' }}
                                                title="Kirim ke Email"
                                            >
                                                <Mail size={14} /> Email
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Review Button - show for arrived flights */}
                                {status?.name === 'Arrived' && (
                                    <button
                                        onClick={e => { e.stopPropagation(); setShowReviewFor({ flightCall: flight?.flightCall, bookingId: booking.bookingId }); }}
                                        style={styles.reviewBtn}
                                    >
                                        <Star size={14} /> Beri Ulasan
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
            {selectedBooking && (
                <BookingDetail booking={selectedBooking} onClose={closeDetail} />
            )}
            {/* Review Form Modal */}
            <AnimatePresence>
                {showReviewFor && (
                    <ReviewForm
                        flightCall={showReviewFor.flightCall}
                        bookingId={showReviewFor.bookingId}
                        token={token}
                        onClose={() => setShowReviewFor(null)}
                        onSuccess={() => { }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        width: '80%',
        maxWidth: '900px',
        margin: '32px auto',
        paddingBottom: '80px',
        fontFamily: theme.fonts.primary,
        color: theme.colors.text
    },
    backLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: 'none',
        color: theme.colors.textMuted,
        cursor: 'pointer',
        marginBottom: '20px',
        fontWeight: theme.fontWeights.semibold,
        fontSize: theme.typography.sm
    },
    header: {
        ...ui.card.base,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '18px',
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        background: `linear-gradient(135deg, ${theme.colors.primary}10 0%, ${theme.colors.primaryDark}08 100%)`
    },
    title: { fontSize: theme.typography['2xl'], fontWeight: theme.fontWeights.extrabold, color: theme.colors.text, margin: 0 },

    loadingBox: { textAlign: 'center', padding: '56px', color: theme.colors.textMuted, fontSize: theme.typography.lg },
    emptyState: { ...ui.card.base, textAlign: 'center', padding: '64px 40px', borderRadius: theme.radius.xl },

    bookingList: { display: 'flex', flexDirection: 'column', gap: theme.spacing.md },
    card: { ...ui.card.base, borderRadius: theme.radius.xl, padding: theme.spacing.xl, transition: 'transform 0.18s ease, box-shadow 0.18s ease', cursor: 'pointer' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottom: `1px dashed ${theme.colors.border}` },
    flightInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
    planeIcon: { width: '40px', height: '40px', borderRadius: theme.radius.lg, background: theme.colors.primaryGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flightCall: { fontWeight: theme.fontWeights.extrabold, fontSize: theme.typography.xl, color: theme.colors.text },
    statusBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', marginTop: '4px' },
    bookingId: { textAlign: 'right' },
    bookingIdLabel: { display: 'block', fontSize: '11px', color: theme.colors.textMuted, fontWeight: theme.fontWeights.semibold },
    bookingIdValue: { fontSize: theme.typography.lg, fontWeight: theme.fontWeights.extrabold, color: theme.colors.text },

    routeSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg, padding: '0 10px' },
    routePoint: { textAlign: 'center', flex: 1 },
    airportCode: { fontSize: theme.typography['2xl'], fontWeight: theme.fontWeights.black, color: theme.colors.text },
    cityName: { fontSize: theme.typography.xs, color: theme.colors.textMuted, marginTop: '2px' },
    timeLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: theme.typography.xs, color: theme.colors.textMuted, marginTop: '8px' },

    routeLine: { display: 'flex', alignItems: 'center', gap: '8px', flex: 2 },
    dashedLine: { flex: 1, height: '1px', borderTop: `2px dashed ${theme.colors.border}` },

    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}` },
    footerItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.typography.sm, color: theme.colors.textMuted },
    reviewBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        marginTop: 10, width: '100%', padding: '10px', borderRadius: 10,
        border: '1.5px solid #fde68a', background: '#fffbeb',
        color: '#92400e', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        justifyContent: 'center', transition: 'all 0.15s',
    },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        border: '1.5px solid #e2e8f0',
        fontWeight: 700, fontSize: 12, cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
    }
};

export default BookingHistory;
