import React, { useState, useEffect } from 'react';
import { User, CheckCircle, ChevronLeft, Users } from 'lucide-react';
import axios from 'axios';
import { theme, ui } from '../../theme';
import PaymentPage from '../payment/PaymentPage';
import ETicket from '../payment/ETicket';
import { useToast } from '../ui/ToastNotification';
import useIsMobile from '../../hooks/useIsMobile';

const BookingView = ({ flight, onBack, user, passengersCount }) => {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengers, setPassengers] = useState(
        Array.from({ length: parseInt(passengersCount) }, (_, i) => ({
            id: i,
            firstName: i === 0 ? (user?.fullName?.split(' ')[0] || '') : '',
            lastName: i === 0 ? (user?.fullName?.split(' ').slice(1).join(' ') || '') : '',
            email: i === 0 ? (user?.email || '') : '',
            phone: ''
        }))
    );
    const [loading, setLoading] = useState(false);
    const [createdBookings, setCreatedBookings] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    useEffect(() => {
        fetchSeats();
    }, []);

    const fetchSeats = async () => {
        try {
            const res = await axios.get(`http://localhost:3333/api/flights/${flight.flightCall}/seats`);
            setSeats(res.data);
        } catch (err) {
            console.error("Gagal ambil kursi:", err);
        }
    };

    const toggleSeat = (seat) => {
        if (selectedSeats.find(s => s.seatId === seat.seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
        } else {
            if (selectedSeats.length < passengersCount) {
                setSelectedSeats([...selectedSeats, seat]);
            } else {
                toast(`Anda hanya memilih ${passengersCount} penumpang, maksimal ${passengersCount} kursi.`, 'warning');
            }
        }
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (selectedSeats.length !== parseInt(passengersCount)) {
            return toast(`Silakan pilih ${passengersCount} kursi terlebih dahulu!`, 'warning');
        }

        setLoading(true);
        try {
            const payload = {
                flightCall: flight.flightCall,
                bookings: selectedSeats.map((seat, index) => ({
                    aircraftId: seat.aircraftId,
                    seatId: seat.seatId,
                    passenger: passengers[index]
                }))
            };

            const res = await axios.post('http://localhost:3333/api/bookings', payload);
            // Store created bookings (with their IDs) for payment
            const serverBookings = res.data.bookings.map((b, i) => ({
                bookingId: b.bookingId,
                seatId: selectedSeats[i]?.seatId || b.seatId,
                className: selectedSeats[i]?.className,
                price: selectedSeats[i]?.price,
            }));
            setCreatedBookings(serverBookings);
            setShowPayment(true);
            toast('Booking berhasil dibuat! Lanjutkan ke pembayaran.', 'info');
        } catch (err) {
            toast('Gagal melakukan booking: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

    // Show Payment Page
    if (showPayment && !showTicket) {
        return (
            <PaymentPage
                bookings={createdBookings}
                flight={flight}
                totalAmount={totalPrice}
                onBack={() => setShowPayment(false)}
                onSuccess={() => { setShowPayment(false); setShowTicket(true); }}
            />
        );
    }

    // Show E-Ticket after payment
    if (showTicket) {
        return (
            <div style={{ minHeight: '100vh', background: theme.colors.background }}>
                <ETicket
                    bookings={createdBookings}
                    flight={flight}
                    passenger={passengers[0]}
                    onClose={onBack}
                />
            </div>
        );
    }

    // Group seats by row
    const rows = {};
    seats.forEach(seat => {
        const match = seat.seatId.match(/(\d+)([A-Z]+)/);
        if (match) {
            const rowNum = parseInt(match[1]);
            const colLetter = match[2];
            if (!rows[rowNum]) rows[rowNum] = [];
            rows[rowNum].push({ ...seat, colLetter });
        }
    });

    const sortedRowNums = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));


    // Calculate min price per class for display
    const priceByClass = {};
    const classColors = {
        'First Class': '#f59e0b', // Gold
        'Business': '#7c3aed',     // Purple 
        'Premium Economy': '#10b981', // Emerald
        'Economy': '#0ea5e9'       // Sky
    };

    seats.forEach(s => {
        if (!priceByClass[s.className] || s.price < priceByClass[s.className]) {
            priceByClass[s.className] = s.price;
        }
    });

    let currentClass = null;

    return (
        <div style={{ ...styles.container, width: isMobile ? '100%' : '90%', padding: isMobile ? '16px' : undefined, boxSizing: 'border-box' }}>
            <button onClick={onBack} style={styles.backLink}><ChevronLeft size={18} /> Kembali</button>

            <div style={{ ...styles.layout, flexDirection: isMobile ? 'column' : 'row' }}>
                {/* Seat Map */}
                <div style={{ ...styles.section, minWidth: isMobile ? 'unset' : '350px' }}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Pilih {passengersCount} Kursi</h3>
                        <span style={styles.badge}>{selectedSeats.length} / {passengersCount} Terpilih</span>
                    </div>

                    <div style={styles.planeBody}>
                        <div style={styles.cockpit}></div>
                        {sortedRowNums.map(rowNum => {
                            const rowSeats = rows[rowNum];
                            rowSeats.sort((a, b) => a.colLetter.localeCompare(b.colLetter));

                            // Determine class (assuming first seat dictates row class)
                            const rowClass = rowSeats[0]?.className;
                            let showClassHeader = false;
                            if (rowClass !== currentClass) {
                                currentClass = rowClass;
                                showClassHeader = true;
                            }

                            const leftSide = rowSeats.filter(s => ['A', 'B', 'C'].includes(s.colLetter));
                            const rightSide = rowSeats.filter(s => ['D', 'E', 'F'].includes(s.colLetter));

                            return (
                                <React.Fragment key={rowNum}>
                                    {showClassHeader && (
                                        <div style={{
                                            ...styles.classHeader,
                                            backgroundColor: classColors[currentClass] ? `${classColors[currentClass]}22` : styles.classHeader.backgroundColor,
                                            color: classColors[currentClass] || styles.classHeader.color,
                                            borderColor: classColors[currentClass]
                                        }}>
                                            {currentClass || 'Travel Class'} (Mulai Rp {parseInt(priceByClass[currentClass] || 0).toLocaleString('id-ID')})
                                        </div>
                                    )}
                                    <div style={styles.row}>
                                        <div style={styles.rowNum}>{rowNum}</div>
                                        <div style={styles.seatGroup}>
                                            {leftSide.map(s => (
                                                <SeatButton
                                                    key={s.seatId}
                                                    seat={s}
                                                    selected={selectedSeats.find(ss => ss.seatId === s.seatId)}
                                                    onToggle={() => toggleSeat(s)}
                                                />
                                            ))}
                                        </div>
                                        <div style={styles.aisle}></div>
                                        <div style={styles.seatGroup}>
                                            {rightSide.map(s => (
                                                <SeatButton
                                                    key={s.seatId}
                                                    seat={s}
                                                    selected={selectedSeats.find(ss => ss.seatId === s.seatId)}
                                                    onToggle={() => toggleSeat(s)}
                                                />
                                            ))}
                                        </div>
                                        <div style={styles.rowNum}>{rowNum}</div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div style={styles.legend}>
                        <div style={styles.legendItem}><div style={{ ...styles.legendColor, backgroundColor: '#fff', border: '1px solid #ddd' }}></div> Tersedia</div>
                        <div style={styles.legendItem}><div style={{ ...styles.legendColor, backgroundColor: '#ddd' }}></div> Terisi</div>
                        <div style={styles.legendItem}><div style={{ ...styles.legendColor, backgroundColor: '#0194f3' }}></div> Terpilih</div>
                    </div>

                    <div style={{ ...styles.legend, marginTop: 10 }}>
                        {Object.entries(classColors).map(([name, color]) => (
                            <div key={name} style={styles.legendItem}>
                                <div style={{ ...styles.legendColor, backgroundColor: color }}></div>
                                {name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Passenger Forms */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Data Penumpang</h3>
                    <form onSubmit={handleBooking} style={styles.form}>
                        {passengers.map((p, idx) => (
                            <div key={idx} style={styles.passengerFormCard}>
                                <div style={styles.passengerHeader}>
                                    <Users size={16} color="#0194f3" />
                                    <span>Penumpang {idx + 1} {idx === 0 ? '(Anda)' : ''}</span>
                                </div>
                                <div style={{ ...styles.inputRow, flexDirection: isMobile ? 'column' : 'row' }}>
                                    <div style={styles.inputGrp}>
                                        <label style={styles.label}>Nama Depan</label>
                                        <input
                                            style={styles.input}
                                            value={p.firstName}
                                            onChange={e => handlePassengerChange(idx, 'firstName', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGrp}>
                                        <label style={styles.label}>Nama Belakang</label>
                                        <input
                                            style={styles.input}
                                            value={p.lastName}
                                            onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={styles.inputGrp}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        style={styles.input}
                                        type="email"
                                        value={p.email}
                                        onChange={e => handlePassengerChange(idx, 'email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGrp}>
                                    <label style={styles.label}>No. Telepon</label>
                                    <input
                                        style={styles.input}
                                        value={p.phone}
                                        onChange={e => handlePassengerChange(idx, 'phone', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        ))}

                        <div style={styles.summaryBox}>
                            <div style={styles.sumRow}>
                                <span>Total Harga ({passengersCount} Tiket):</span>
                                <strong style={styles.totalPrice}>Rp {parseInt(totalPrice || 0).toLocaleString('id-ID')}</strong>
                            </div>
                            <div style={styles.sumRow}>
                                <span>Kursi:</span>
                                <strong>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatId).join(', ') : '-'}</strong>
                            </div>
                            {/* Detailed price breakdown */}
                            {selectedSeats.length > 0 && (
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                                    {selectedSeats.map(s => (
                                        <div key={s.seatId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Kursi {s.seatId} ({s.className})</span>
                                            <span>Rp {parseInt(s.price || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            style={styles.bookBtn}
                            disabled={loading || selectedSeats.length !== parseInt(passengersCount)}
                        >
                            {loading ? 'Memproses...' : `Konfirmasi Booking (${passengersCount} Kursi)`}
                        </button>
                    </form>
                </div>
            </div >
        </div >
    );
};

const SeatButton = ({ seat, selected, onToggle }) => {
    const classColors = {
        'First Class': '#f59e0b',
        'Business': '#7c3aed',
        'Premium Economy': '#10b981',
        'Economy': '#0ea5e9'
    };
    const classColor = classColors[seat.className] || '#64748b';
    return (
        <button
            disabled={!seat.isAvailable}
            onClick={onToggle}
            style={{
                ...styles.seat,
                backgroundColor: !seat.isAvailable ? '#e2e8f0' : (selected ? classColor : theme.colors.surface),
                color: selected ? '#fff' : (!seat.isAvailable ? '#64748b' : classColor),
                border: selected ? `2px solid ${classColor}` : `1px solid ${!seat.isAvailable ? '#cbd5e1' : classColor}`,
                cursor: !seat.isAvailable ? 'not-allowed' : 'pointer',
                opacity: 1, // Keep initials visible
                boxShadow: !seat.isAvailable ? 'none' : (selected ? `0 0 10px ${classColor}40` : 'none'),
                fontSize: !seat.isAvailable ? '12px' : '10px',
                fontWeight: !seat.isAvailable ? '800' : '700'
            }}
            title={!seat.isAvailable ? `Terisi oleh ${seat.passengerInitials || 'Penumpang'}` : `Seat ${seat.seatId} - ${seat.className} - Rp ${parseInt(seat.price || 0).toLocaleString('id-ID')}`}
        >
            {seat.isAvailable ? seat.seatId : (seat.passengerInitials || 'X')}
        </button>
    );
};

const styles = {
    container: { width: '90%', margin: '32px auto', paddingBottom: '100px', fontFamily: theme.fonts.primary, color: theme.colors.text },
    backLink: { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: theme.colors.textMuted, cursor: 'pointer', marginBottom: '16px', fontWeight: theme.fontWeights.semibold },
    layout: { display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' },
    section: { flex: 1, ...ui.card.base, borderRadius: theme.radius.xl, padding: 24, minWidth: '350px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 12 },
    sectionTitle: { fontSize: '18px', fontWeight: theme.fontWeights.extrabold, color: theme.colors.text, margin: 0 },
    badge: { backgroundColor: `${theme.colors.primary}14`, color: theme.colors.primary, padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: theme.fontWeights.bold, border: `1px solid ${theme.colors.primary}22` },

    planeBody: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: `${theme.colors.primary}08`, padding: 18, borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}` },
    cockpit: { width: '60%', height: '40px', backgroundColor: theme.colors.border, borderRadius: '50px 50px 0 0', marginBottom: '20px' },

    classHeader: { width: '100%', textAlign: 'center', padding: '10px', backgroundColor: `${theme.colors.primary}14`, color: theme.colors.primaryDark, fontWeight: theme.fontWeights.bold, borderRadius: theme.radius.md, margin: '15px 0 10px 0', fontSize: '12px', textTransform: 'uppercase', border: `1px solid ${theme.colors.primary}22` },

    row: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px' },
    rowNum: { width: '20px', textAlign: 'center', fontSize: '12px', color: '#888', fontWeight: 'bold' },
    seatGroup: { display: 'flex', gap: '5px' },
    aisle: { width: '30px' },

    seat: { width: '35px', height: '35px', borderRadius: '10px', fontSize: '10px', fontWeight: theme.fontWeights.bold, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0 },

    legend: { display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.colors.textMuted },
    legendColor: { width: '16px', height: '16px', borderRadius: '4px' },

    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    passengerFormCard: { padding: 18, backgroundColor: `${theme.colors.primary}06`, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' },
    passengerHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: theme.fontWeights.bold, fontSize: '14px', color: theme.colors.text, marginBottom: '5px' },
    inputRow: { display: 'flex', gap: '15px' },
    inputGrp: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    label: { fontSize: '12px', fontWeight: theme.fontWeights.bold, color: theme.colors.textMuted },
    input: { ...ui.input.base },
    summaryBox: { backgroundColor: theme.colors.background, padding: 18, borderRadius: theme.radius.lg, marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', border: `1px solid ${theme.colors.border}` },
    sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: theme.colors.textMuted, alignItems: 'center' },
    totalPrice: { fontSize: '20px', color: theme.colors.accent, fontWeight: theme.fontWeights.black },
    bookBtn: { ...ui.button.primary, padding: '14px', fontSize: theme.typography.base },
    successCard: { ...ui.card.base, textAlign: 'center', padding: '56px', borderRadius: theme.radius['3xl'], boxShadow: theme.shadows['2xl'], width: '90%', maxWidth: '520px', margin: '90px auto' },
    ticketSummary: { backgroundColor: theme.colors.background, padding: 18, borderRadius: theme.radius.lg, margin: '18px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', border: `1px solid ${theme.colors.border}` },
    backBtn: { ...ui.button.primary }
};

export default BookingView;
