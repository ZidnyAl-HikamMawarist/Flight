import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, ThumbsUp, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { theme, ui } from '../../theme';
import { useToast } from '../ui/ToastNotification';

// Star Rating Input Component
const StarRating = ({ value, onChange, size = 28 }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 2, transition: 'transform 0.1s',
                        transform: hovered >= star ? 'scale(1.2)' : 'scale(1)',
                    }}
                >
                    <Star
                        size={size}
                        fill={(hovered || value) >= star ? '#f59e0b' : 'none'}
                        color={(hovered || value) >= star ? '#f59e0b' : '#d1d5db'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
};

// Display Rating (read-only)
export const RatingDisplay = ({ rating, showCount, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(s => (
            <Star
                key={s}
                size={14}
                fill={rating >= s ? '#f59e0b' : 'none'}
                color={rating >= s ? '#f59e0b' : '#d1d5db'}
                strokeWidth={1.5}
            />
        ))}
        {showCount && <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>({count})</span>}
    </div>
);

// Review form modal
const ReviewForm = ({ flightCall, bookingId, token, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const ratingLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Luar Biasa!'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return setError('Pilih bintang rating terlebih dahulu!');

        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:3333/api/reviews', {
                flightCall,
                bookingId,
                rating,
                comment,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSubmitted(true);
            toast('Ulasan berhasil dikirim! 🙏', 'success');
            if (onSuccess) onSuccess();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal mengirim ulasan';
            setError(msg);
            toast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={styles.modal}
            >
                {submitted ? (
                    <div style={styles.successState}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <CheckCircle size={64} color="#10b981" strokeWidth={1.5} />
                        </motion.div>
                        <h3 style={{ fontWeight: 900, color: '#0f172a', margin: '16px 0 8px' }}>Terima Kasih! 🙏</h3>
                        <p style={{ color: '#64748b', marginBottom: 20 }}>Ulasan Anda membantu penumpang lain memilih penerbangan terbaik.</p>
                        <button onClick={onClose} style={ui.button.primary}>Tutup</button>
                    </div>
                ) : (
                    <>
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={styles.modalTitle}>Beri Ulasan Penerbangan</h3>
                                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>✈ {flightCall}</div>
                            </div>
                            <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Star Rating */}
                            <div style={styles.ratingSection}>
                                <div style={styles.sectionLabel}>Penilaian Keseluruhan</div>
                                <StarRating value={rating} onChange={setRating} size={36} />
                                {rating > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={styles.ratingLabel}
                                    >
                                        {ratingLabels[rating]}
                                        {rating === 5 && ' ⭐'}
                                        {rating === 4 && ' 👍'}
                                        {rating <= 2 && ' 😞'}
                                    </motion.div>
                                )}
                            </div>

                            {/* Comment */}
                            <div style={styles.commentSection}>
                                <div style={styles.sectionLabel}>Komentar (Opsional)</div>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Ceritakan pengalaman Anda... (ketepatan waktu, kenyamanan, layanan, dll)"
                                    rows={4}
                                    style={styles.textarea}
                                    maxLength={500}
                                />
                                <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>{comment.length}/500</div>
                            </div>

                            {/* Quick Tags */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={styles.sectionLabel}>Tag Cepat</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {['Tepat Waktu', 'Kursi Nyaman', 'Pelayanan Baik', 'Makanan Enak', 'Harga Terjangkau', 'Terlambat', 'Kursi Sempit'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setComment(prev => prev ? `${prev}, ${tag}` : tag)}
                                            style={styles.tagBtn}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && <div style={styles.errorBox}>{error}</div>}

                            <button
                                type="submit"
                                disabled={loading || !rating}
                                style={{
                                    ...ui.button.primary,
                                    width: '100%', padding: 14,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    opacity: (!rating || loading) ? 0.6 : 1,
                                }}
                            >
                                <Send size={16} />
                                {loading ? 'Mengirim...' : 'Kirim Ulasan'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

// Reviews list for a flight
export const FlightReviews = ({ flightCall }) => {
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:3333/api/flights/${flightCall}/reviews`)
            .then(res => {
                setReviews(res.data.reviews);
                setAvgRating(res.data.averageRating);
                setTotal(res.data.total);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [flightCall]);

    if (loading || reviews.length === 0) return null;

    const displayed = showAll ? reviews : reviews.slice(0, 3);

    return (
        <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Ulasan Penumpang</div>
                <RatingDisplay rating={avgRating} showCount total={total} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{avgRating}/5 dari {total} ulasan</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayed.map(r => (
                    <div key={r.reviewId} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                                {r.user?.fullName || 'Penumpang Anonim'}
                            </div>
                            <RatingDisplay rating={r.rating} />
                        </div>
                        {r.comment && <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{r.comment}</div>}
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                            {new Date(r.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                ))}
            </div>
            {total > 3 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    style={{ marginTop: 10, background: 'none', border: 'none', color: '#0194f3', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                >
                    {showAll ? 'Tampilkan lebih sedikit' : `Lihat semua ${total} ulasan →`}
                </button>
            )}
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    },
    modal: {
        width: '100%', maxWidth: 500,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        padding: 28, fontFamily: theme.fonts.primary,
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9',
    },
    modalTitle: { fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 },
    closeBtn: {
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: 6, cursor: 'pointer', color: '#64748b',
        display: 'flex', alignItems: 'center',
    },
    ratingSection: {
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20,
        alignItems: 'flex-start',
    },
    ratingLabel: {
        fontWeight: 800, fontSize: 16, color: '#f59e0b',
    },
    sectionLabel: {
        fontSize: 12, fontWeight: 700, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
    },
    commentSection: { marginBottom: 16 },
    textarea: {
        width: '100%', padding: '12px 14px',
        border: '1.5px solid #e2e8f0', borderRadius: 12,
        fontSize: 14, color: '#0f172a', resize: 'vertical',
        fontFamily: theme.fonts.primary, outline: 'none',
        boxSizing: 'border-box',
    },
    tagBtn: {
        padding: '5px 12px', borderRadius: 999,
        border: '1.5px solid #e2e8f0', background: '#f8fafc',
        color: '#64748b', fontWeight: 600, fontSize: 12, cursor: 'pointer',
        transition: 'all 0.15s',
    },
    errorBox: {
        background: '#fff1f2', border: '1px solid #fecdd3',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 13, color: '#e11d48', fontWeight: 600, marginBottom: 12,
    },
    successState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '20px 0',
    },
};

export default ReviewForm;
