import React, { useRef } from 'react';
import { Plane, Printer, Download, CheckCircle, QrCode, Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Simple inline QR-like visual (no external library needed)
const QRVisual = ({ value, size = 100 }) => {
    // Generate a pseudo-random grid based on value string for visual QR representation
    const hash = Array.from(value || 'QR').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const cells = Array.from({ length: 9 }, (_, i) =>
        Array.from({ length: 9 }, (_, j) => {
            const seed = (hash * (i + 1) * (j + 1) + i * 31 + j * 17) % 7;
            // Keep corners solid (QR finder pattern)
            if ((i < 3 && j < 3) || (i < 3 && j > 5) || (i > 5 && j < 3)) return true;
            return seed < 4;
        })
    );

    return (
        <div style={{
            width: size, height: size,
            display: 'grid', gridTemplateColumns: `repeat(9, 1fr)`,
            gap: 1, padding: 4, background: '#fff', borderRadius: 4,
        }}>
            {cells.flat().map((filled, idx) => (
                <div key={idx} style={{ background: filled ? '#1e293b' : '#fff', borderRadius: 1 }} />
            ))}
        </div>
    );
};

const ETicket = ({ bookings, flight, passenger, onClose }) => {
    // bookings: array of { bookingId, seatId, className, price }
    // flight: flight object with schedule
    // passenger: primary passenger object { firstName, lastName, email }
    const ticketRef = useRef(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const handlePrint = () => {
        window.print();
    };

    const originCity = flight?.schedule?.originAirport?.city || 'Origin';
    const destCity = flight?.schedule?.destinationAirport?.city || 'Destination';
    const originCode = flight?.schedule?.originAirport?.iataAirportCode || 'ORG';
    const destCode = flight?.schedule?.destinationAirport?.iataAirportCode || 'DST';
    const departTime = formatTime(flight?.schedule?.departureTimeGmt);
    const arriveTime = formatTime(flight?.schedule?.arrivalTimeGmt);
    const flightDate = formatDate(flight?.schedule?.departureTimeGmt);

    const bookingRef = bookings?.[0]?.bookingId
        ? `BK${String(bookings[0].bookingId).padStart(6, '0')}`
        : 'BK------';

    return (
        <div style={styles.overlay}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={styles.modalWrap}
            >
                {/* Action Buttons */}
                <div style={styles.actionBar}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        ✈ E-Ticket / Boarding Pass
                    </h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handlePrint} style={styles.printBtn}>
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={onClose} style={styles.closeBtn}>Tutup ✕</button>
                    </div>
                </div>

                {/* Ticket */}
                <div ref={ticketRef} style={styles.ticket} id="eticket">
                    {/* Header */}
                    <div style={styles.ticketHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={styles.logoCircle}><Plane size={20} color="#fff" /></div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 16, color: '#fff' }}>FlightBooking</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>BOARDING PASS</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>KODE BOOKING</div>
                            <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: 2 }}>{bookingRef}</div>
                        </div>
                    </div>

                    {/* Route Section */}
                    <div style={styles.routeSection}>
                        <div style={styles.cityBlock}>
                            <div style={styles.cityCode}>{originCode}</div>
                            <div style={styles.cityName}>{originCity}</div>
                            <div style={styles.time}>{departTime}</div>
                        </div>

                        <div style={styles.routeLine}>
                            <div style={styles.routeDot} />
                            <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #0194f3, #7c3aed)', position: 'relative' }}>
                                <Plane
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: '#0194f3',
                                        filter: 'drop-shadow(0 2px 4px rgba(1,148,243,0.4))',
                                    }}
                                />
                            </div>
                            <div style={styles.routeDot} />
                        </div>

                        <div style={{ ...styles.cityBlock, textAlign: 'right' }}>
                            <div style={styles.cityCode}>{destCode}</div>
                            <div style={styles.cityName}>{destCity}</div>
                            <div style={styles.time}>{arriveTime}</div>
                        </div>
                    </div>

                    {/* Passenger & Flight Info */}
                    <div style={styles.infoGrid}>
                        <div style={styles.infoBlock}>
                            <div style={styles.infoLabel}>PENUMPANG</div>
                            <div style={styles.infoValue}>{passenger?.firstName} {passenger?.lastName}</div>
                        </div>
                        <div style={styles.infoBlock}>
                            <div style={styles.infoLabel}>PENERBANGAN</div>
                            <div style={styles.infoValue}>{flight?.flightCall}</div>
                        </div>
                        <div style={styles.infoBlock}>
                            <div style={styles.infoLabel}>TANGGAL</div>
                            <div style={styles.infoValue}>{flightDate}</div>
                        </div>
                        <div style={styles.infoBlock}>
                            <div style={styles.infoLabel}>KURSI</div>
                            <div style={styles.infoValue}>{bookings?.map(b => b.seatId).join(', ')}</div>
                        </div>
                    </div>

                    {/* Tear Border */}
                    <div style={styles.tearBorder}>
                        {Array.from({ length: 28 }, (_, i) => (
                            <div key={i} style={styles.tearDot} />
                        ))}
                    </div>

                    {/* Barcode / QR Section */}
                    <div style={styles.qrSection}>
                        <div style={{ flex: 1 }}>
                            <div style={styles.infoLabel}>STATUS</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ fontWeight: 800, color: '#10b981', fontSize: 15 }}>CONFIRMED</span>
                            </div>
                            <div style={{ marginTop: 14 }}>
                                <div style={styles.infoLabel}>KELAS</div>
                                <div style={styles.infoValue}>{bookings?.[0]?.className || 'Economy'}</div>
                            </div>
                            <div style={{ marginTop: 14 }}>
                                <div style={styles.infoLabel}>EMAIL</div>
                                <div style={{ ...styles.infoValue, fontSize: 12 }}>{passenger?.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={styles.qrFrame}>
                                <QRVisual value={bookingRef} size={110} />
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>SCAN TO VERIFY</div>
                        </div>
                    </div>

                    {/* Multiple Seats */}
                    {bookings && bookings.length > 1 && (
                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={styles.infoLabel}>SEMUA TIKET</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                {bookings.map((b, i) => (
                                    <div key={b.bookingId} style={styles.seatTag}>
                                        <span style={{ fontWeight: 700 }}>#{i + 1}</span> Kursi {b.seatId}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #eticket, #eticket * { visibility: visible; }
                    #eticket { position: fixed; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center',
        padding: 24,
        overflowY: 'auto', // Allow scrolling if content is tall
    },
    modalWrap: {
        width: '100%', maxWidth: 620,
        display: 'flex', flexDirection: 'column', gap: 16,
        margin: 'auto', // Center vertically if short, scrollable if tall
        position: 'relative'
    },
    actionBar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff', borderRadius: 16, padding: '16px 20px',
    },
    printBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 10,
        border: '1.5px solid #e2e8f0', background: '#f8fafc',
        color: '#475569', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    closeBtn: {
        padding: '8px 16px', borderRadius: 10,
        border: 'none', background: '#0194f3',
        color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    ticket: {
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
    },
    ticketHeader: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #7c3aed 100%)',
        padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    logoCircle: {
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    routeSection: {
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '28px 28px 20px',
    },
    cityBlock: { flex: 1, textAlign: 'left' },
    cityCode: { fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: -2 },
    cityName: { fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 },
    time: { fontSize: 18, fontWeight: 800, color: '#0194f3', marginTop: 6 },
    routeLine: {
        flex: 2, display: 'flex', alignItems: 'center', gap: 4,
    },
    routeDot: {
        width: 10, height: 10, borderRadius: '50%',
        background: '#0194f3', flexShrink: 0,
    },
    infoGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '16px 24px', padding: '0 28px 24px',
        borderTop: '1px solid #f1f5f9',
        paddingTop: 20,
    },
    infoBlock: {},
    infoLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
    infoValue: { fontSize: 15, fontWeight: 800, color: '#0f172a' },
    tearBorder: {
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        background: '#f8fafc', padding: '10px 0',
        borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0',
    },
    tearDot: { width: 8, height: 8, borderRadius: '50%', background: '#e2e8f0' },
    qrSection: {
        display: 'flex', gap: 20, padding: '20px 28px 28px',
        alignItems: 'flex-start',
    },
    qrFrame: {
        padding: 6, border: '2px solid #e2e8f0', borderRadius: 12,
        background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    },
    seatTag: {
        background: '#f0f9ff', border: '1px solid #bae6fd',
        borderRadius: 8, padding: '6px 12px',
        fontSize: 13, color: '#0369a1', fontWeight: 600,
    },
};

export default ETicket;
