import React, { useState, useEffect } from 'react';
import { BarChart3, PlaneTakeoff, MapPin, Ticket, Users, Plus, Trash2, ChevronLeft, X, Edit } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { theme, ui } from '../../theme';

const AdminPanel = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [airports, setAirports] = useState([]);
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [aircrafts, setAircrafts] = useState([]);
    const [showModal, setShowModal] = useState(null); // 'airport' | 'flight'
    const [loading, setLoading] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null)
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // New airport form
    const [airportForm, setAirportForm] = useState({ iataAirportCode: '', name: '', city: '', iataCountryCode: '' });
    // New flight form
    const [flightForm, setFlightForm] = useState({
        flightCall: '', origin: '', destination: '', departureTime: '', arrivalTime: '',
        statusId: '', aircraftId: '', economyPrice: 750000, premiumPrice: 1500000, businessPrice: 3500000, firstPrice: 12000000
    });

    useEffect(() => {
        fetchStats();
        fetchStatuses();
        fetchAircrafts();
    }, []);

    useEffect(() => {
        if (activeTab === 'airports') fetchAirports();
        if (activeTab === 'flights') {
            fetchFlights();
            // ensure airports are loaded so origin/destination selects have options
            fetchAirports();
        }
        if (activeTab === 'bookings') fetchBookings();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAirports = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/airports');
            setAirports(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchFlights = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/flights');
            setFlights(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/bookings');
            setBookings(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchStatuses = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/statuses');
            setStatuses(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAircrafts = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/aircrafts');
            setAircrafts(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchSeats = async (aircraftId) => {
        if (!aircraftId) return;
        try {
            const res = await axios.get(`http://localhost:3333/api/aircraft/${aircraftId}/seats`);
            setSeats(res.data);
        } catch (err) {
            console.error("Gagal ambil kursi:", err);
        }
    };

    const toggleSeat = (seat) => {
        if (selectedSeats.find(s => s.seatId === seat.seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleAircraftChange = (aircraftId) => {
        setFlightForm({ ...flightForm, aircraftId });
        setSeats([]);
        setSelectedSeats([]);
        if (aircraftId) {
            fetchSeats(aircraftId);
        }
    };

    const handleAddAirport = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3333/api/admin/airports', airportForm);
            setShowModal(null);
            setAirportForm({ iataAirportCode: '', name: '', city: '', iataCountryCode: '' });
            fetchAirports();
            fetchStats();
        } catch (err) {
            alert('Gagal menambahkan bandara: ' + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    const handleDeleteAirport = async (code) => {
        if (!confirm('Hapus bandara ' + code + '?')) return;
        try {
            await axios.delete(`http://localhost:3333/api/admin/airports/${code}`);
            fetchAirports();
            fetchStats();
        } catch (err) { alert('Gagal: ' + err.message); }
    };

    const handleAddFlight = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3333/api/admin/flights', flightForm);
            setShowModal(null);
            setFlightForm({
                flightCall: '', origin: '', destination: '', departureTime: '', arrivalTime: '',
                statusId: '', aircraftId: '', economyPrice: 750000, premiumPrice: 1500000, businessPrice: 3500000, firstPrice: 12000000
            });
            fetchFlights();
            fetchStats();
        } catch (err) {
            alert('Gagal menambahkan penerbangan: ' + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };
    const toLocalDatetime = (iso) => {
        if (!iso) return ''
        const d = new Date(iso)
        const pad = (n) => String(n).padStart(2, '0')
        const yyyy = d.getFullYear()
        const mm = pad(d.getMonth() + 1)
        const dd = pad(d.getDate())
        const hh = pad(d.getHours())
        const min = pad(d.getMinutes())
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`
    }

    const handleSaveFlight = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingFlight) {
                await axios.put(`http://localhost:3333/api/admin/flights/${editingFlight}`, flightForm);
            } else {
                await axios.post('http://localhost:3333/api/admin/flights', flightForm);
            }
            setShowModal(null);
            setFlightForm({
                flightCall: '', origin: '', destination: '', departureTime: '', arrivalTime: '',
                statusId: '', aircraftId: '', economyPrice: 750000, premiumPrice: 1500000, businessPrice: 3500000, firstPrice: 12000000
            });
            setEditingFlight(null);
            setSeats([]);
            setSelectedSeats([]);
            fetchFlights();
            fetchStats();
        } catch (err) {
            alert('Gagal menyimpan penerbangan: ' + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    const openEditFlight = (f) => {
        setEditingFlight(f.flightCall)
        setSeats([]);
        setSelectedSeats([]);
        setFlightForm({
            flightCall: f.flightCall,
            origin: f.schedule?.originAirport?.iataAirportCode || '',
            destination: f.schedule?.destinationAirport?.iataAirportCode || '',
            departureTime: toLocalDatetime(f.schedule?.departureTimeGmt),
            arrivalTime: toLocalDatetime(f.schedule?.arrivalTimeGmt),
            statusId: f.flightStatusId || f.status?.flightStatusId || '',
            aircraftId: f.aircraftId || '',
            economyPrice: 750000,
            premiumPrice: 1500000,
            businessPrice: 3500000,
            firstPrice: 12000000
        })
        setShowModal('flight')
        if (f.aircraftId) {
            fetchSeats(f.aircraftId);
        }
    }

    const handleDeleteFlight = async (flightCall) => {
        if (!confirm('Hapus penerbangan ' + flightCall + '?')) return;
        try {
            await axios.delete(`http://localhost:3333/api/admin/flights/${flightCall}`);
            fetchFlights();
            fetchStats();
        } catch (err) { alert('Gagal: ' + err.message); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
        { id: 'airports', label: 'Bandara', icon: <MapPin size={18} /> },
        { id: 'flights', label: 'Penerbangan', icon: <PlaneTakeoff size={18} /> },
        { id: 'bookings', label: 'Booking', icon: <Ticket size={18} /> },
    ];

    return (
        <div style={styles.layout}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarLogo}>
                    <PlaneTakeoff size={24} color="#fff" />
                    <span>Admin Panel</span>
                </div>
                <nav style={styles.sidebarNav}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                ...styles.navItem,
                                backgroundColor: activeTab === t.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                            }}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </nav>
                <div style={styles.sidebarFooter}>
                    <div style={styles.sidebarUser}>{user?.fullName}</div>
                    <button onClick={onLogout} style={styles.sidebarLogout}>Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div>
                        <h2 style={styles.pageTitle}>Dashboard</h2>
                        <div style={styles.statsGrid}>
                            {[
                                { label: 'Total Penerbangan', value: stats.flights || 0, color: theme.colors.primary, icon: <PlaneTakeoff size={28} /> },
                                { label: 'Total Booking', value: stats.bookings || 0, color: theme.colors.success, icon: <Ticket size={28} /> },
                                { label: 'Total Bandara', value: stats.airports || 0, color: theme.colors.warning, icon: <MapPin size={28} /> },
                                { label: 'Total Pesawat', value: stats.aircrafts || 0, color: theme.colors.accent, icon: <BarChart3 size={28} /> },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    style={styles.statCard}
                                >
                                    <div style={{ ...styles.statIcon, backgroundColor: `${s.color}20`, color: s.color }}>{s.icon}</div>
                                    <div>
                                        <div style={styles.statValue}>{s.value}</div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Airports Tab */}
                {activeTab === 'airports' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <h2 style={styles.pageTitle}>Manajemen Bandara</h2>
                            <button onClick={() => setShowModal('airport')} style={styles.addBtn}><Plus size={18} /> Tambah Bandara</button>
                        </div>
                        <div style={styles.table}>
                            <div style={styles.tableHeader}>
                                <span style={{ flex: 1 }}>Kode</span>
                                <span style={{ flex: 3 }}>Nama</span>
                                <span style={{ flex: 2 }}>Kota</span>
                                <span style={{ flex: 1 }}>Negara</span>
                                <span style={{ flex: 1 }}>Aksi</span>
                            </div>
                            {airports.map(ap => (
                                <div key={ap.iataAirportCode} style={styles.tableRow}>
                                    <span style={{ flex: 1, fontWeight: 800 }}>{ap.iataAirportCode}</span>
                                    <span style={{ flex: 3 }}>{ap.name}</span>
                                    <span style={{ flex: 2 }}>{ap.city}</span>
                                    <span style={{ flex: 1 }}>{ap.iataCountryCode}</span>
                                    <span style={{ flex: 1 }}>
                                        <button onClick={() => handleDeleteAirport(ap.iataAirportCode)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Flights Tab */}
                {activeTab === 'flights' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <h2 style={styles.pageTitle}>Manajemen Penerbangan</h2>
                            <button onClick={() => setShowModal('flight')} style={styles.addBtn}><Plus size={18} /> Tambah Penerbangan</button>
                        </div>
                        <div style={styles.table}>
                            <div style={styles.tableHeader}>
                                <span style={{ flex: 1 }}>Kode</span>
                                <span style={{ flex: 2 }}>Asal</span>
                                <span style={{ flex: 2 }}>Tujuan</span>
                                <span style={{ flex: 1 }}>Status</span>
                                <span style={{ flex: 1 }}>Aksi</span>
                            </div>
                            {flights.map(f => (
                                <div key={f.flightCall} style={styles.tableRow}>
                                    <span style={{ flex: 1, fontWeight: 800 }}>{f.flightCall}</span>
                                    <span style={{ flex: 2 }}>{f.schedule?.originAirport?.city} ({f.schedule?.originAirport?.iataAirportCode})</span>
                                    <span style={{ flex: 2 }}>{f.schedule?.destinationAirport?.city} ({f.schedule?.destinationAirport?.iataAirportCode})</span>
                                    <span style={{ flex: 1 }}>
                                        <span style={styles.statusTag}>{f.status?.name}</span>
                                    </span>
                                    <span style={{ flex: 1 }}>
                                        <button onClick={() => openEditFlight(f)} style={styles.editBtn} title="Edit Penerbangan"><Edit size={14} /></button>
                                        <button onClick={() => handleDeleteFlight(f.flightCall)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div>
                        <h2 style={styles.pageTitle}>Monitoring Booking</h2>
                        <div style={styles.table}>
                            <div style={styles.tableHeader}>
                                <span style={{ flex: 1 }}>ID</span>
                                <span style={{ flex: 2 }}>Penumpang</span>
                                <span style={{ flex: 1 }}>Penerbangan</span>
                                <span style={{ flex: 1 }}>Kursi</span>
                                <span style={{ flex: 2 }}>Rute</span>
                                <span style={{ flex: 2 }}>Tanggal</span>
                            </div>
                            {bookings.map(b => (
                                <div key={b.bookingId} style={styles.tableRow}>
                                    <span style={{ flex: 1, fontWeight: 800 }}>#{b.bookingId}</span>
                                    <span style={{ flex: 2 }}>{b.client?.firstName} {b.client?.lastName}</span>
                                    <span style={{ flex: 1 }}>{b.flightCall}</span>
                                    <span style={{ flex: 1 }}>{b.seatId}</span>
                                    <span style={{ flex: 2 }}>
                                        {b.flight?.schedule?.originAirport?.iataAirportCode} → {b.flight?.schedule?.destinationAirport?.iataAirportCode}
                                    </span>
                                    <span style={{ flex: 2 }}>{formatDate(b.createdAt)}</span>
                                </div>
                            ))}
                            {bookings.length === 0 && <div style={styles.emptyTable}>Belum ada booking.</div>}
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showModal === 'airport' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.overlay}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h3>Tambah Bandara Baru</h3>
                                <button onClick={() => setShowModal(null)} style={styles.closeBtn}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddAirport} style={styles.modalForm}>
                                <input style={styles.modalInput} placeholder="Kode IATA (cth: CGK)" maxLength={3} value={airportForm.iataAirportCode} onChange={e => setAirportForm({ ...airportForm, iataAirportCode: e.target.value.toUpperCase() })} required />
                                <input style={styles.modalInput} placeholder="Nama Bandara" value={airportForm.name} onChange={e => setAirportForm({ ...airportForm, name: e.target.value })} required />
                                <input style={styles.modalInput} placeholder="Kota" value={airportForm.city} onChange={e => setAirportForm({ ...airportForm, city: e.target.value })} required />
                                <input style={styles.modalInput} placeholder="Kode Negara (cth: ID)" maxLength={2} value={airportForm.iataCountryCode} onChange={e => setAirportForm({ ...airportForm, iataCountryCode: e.target.value.toUpperCase() })} required />
                                <button type="submit" style={styles.modalSubmit} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {showModal === 'flight' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.overlay}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ ...styles.modal, maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={styles.modalHeader}>
                                <h3>{editingFlight ? 'Edit Penerbangan' : 'Tambah Penerbangan Baru'}</h3>
                                <button onClick={() => { setShowModal(null); setEditingFlight(null); setSeats([]); setSelectedSeats([]); }} style={styles.closeBtn}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveFlight} style={styles.modalForm}>
                                <div style={styles.formRow}>
                                    <input style={{ ...styles.modalInput, flex: 1 }} placeholder="Kode Penerbangan (cth: GA-402)" value={flightForm.flightCall} onChange={e => setFlightForm({ ...flightForm, flightCall: e.target.value })} required />
                                </div>
                                <div style={styles.formRow}>
                                    <select style={{ ...styles.modalInput, flex: 1 }} value={flightForm.origin} onChange={e => setFlightForm({ ...flightForm, origin: e.target.value })} required>
                                        <option value="">Bandara Asal</option>
                                        {airports.map(a => <option key={a.iataAirportCode} value={a.iataAirportCode}>{a.city} ({a.iataAirportCode})</option>)}
                                    </select>
                                    <select style={{ ...styles.modalInput, flex: 1 }} value={flightForm.destination} onChange={e => setFlightForm({ ...flightForm, destination: e.target.value })} required>
                                        <option value="">Bandara Tujuan</option>
                                        {airports.map(a => <option key={a.iataAirportCode} value={a.iataAirportCode}>{a.city} ({a.iataAirportCode})</option>)}
                                    </select>
                                </div>
                                <div style={styles.formRow}>
                                    <input style={{ ...styles.modalInput, flex: 1 }} type="datetime-local" value={flightForm.departureTime} onChange={e => setFlightForm({ ...flightForm, departureTime: e.target.value })} required />
                                    <input style={{ ...styles.modalInput, flex: 1 }} type="datetime-local" value={flightForm.arrivalTime} onChange={e => setFlightForm({ ...flightForm, arrivalTime: e.target.value })} required />
                                </div>
                                <div style={styles.formRow}>
                                    <select style={{ ...styles.modalInput, flex: 1 }} value={flightForm.aircraftId} onChange={e => handleAircraftChange(e.target.value)} required>
                                        <option value="">Pilih Pesawat</option>
                                        {aircrafts.map(a => <option key={a.aircraftId} value={a.aircraftId}>{a.model} ({a.aircraftId})</option>)}
                                    </select>
                                    <select style={{ ...styles.modalInput, flex: 1 }} value={flightForm.statusId} onChange={e => setFlightForm({ ...flightForm, statusId: e.target.value })} required>
                                        <option value="">Status Penerbangan</option>
                                        {statuses.map(s => <option key={s.flightStatusId} value={s.flightStatusId}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div style={styles.formRow}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>First (Rp)</label>
                                        <input style={styles.modalInput} type="number" value={flightForm.firstPrice} onChange={e => setFlightForm({ ...flightForm, firstPrice: parseInt(e.target.value) })} required />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>Business (Rp)</label>
                                        <input style={styles.modalInput} type="number" value={flightForm.businessPrice} onChange={e => setFlightForm({ ...flightForm, businessPrice: parseInt(e.target.value) })} required />
                                    </div>
                                </div>
                                <div style={styles.formRow}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>Premium (Rp)</label>
                                        <input style={styles.modalInput} type="number" value={flightForm.premiumPrice} onChange={e => setFlightForm({ ...flightForm, premiumPrice: parseInt(e.target.value) })} required />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>Economy (Rp)</label>
                                        <input style={styles.modalInput} type="number" value={flightForm.economyPrice} onChange={e => setFlightForm({ ...flightForm, economyPrice: parseInt(e.target.value) })} required />
                                    </div>
                                </div>

                                {/* Seat Selection Section */}
                                {flightForm.aircraftId && (
                                    <div style={styles.seatSection}>
                                        <div style={styles.seatSectionHeader}>
                                            <h4 style={styles.seatSectionTitle}>Pilih Kursi yang Tersedia</h4>
                                            <span style={styles.seatBadge}>{selectedSeats.length} Kursi Dipilih</span>
                                        </div>
                                        <div style={styles.seatGrid}>
                                            {seats.map(s => {
                                                const isSelected = selectedSeats.find(ss => ss.seatId === s.seatId);
                                                return (
                                                    <button
                                                        key={s.seatId}
                                                        type="button"
                                                        disabled={!s.isAvailable}
                                                        onClick={() => toggleSeat(s)}
                                                        style={{
                                                            ...styles.seat,
                                                            backgroundColor: !s.isAvailable ? theme.colors.background : (isSelected ? theme.colors.primary : theme.colors.surface),
                                                            color: isSelected ? theme.colors.surface : theme.colors.text,
                                                            border: isSelected ? `2px solid ${theme.colors.primaryDark}` : `1px solid ${theme.colors.border}`,
                                                            cursor: !s.isAvailable ? 'not-allowed' : 'pointer',
                                                            opacity: !s.isAvailable ? 0.6 : 1
                                                        }}
                                                    >
                                                        {s.seatId}
                                                        <div style={{ ...styles.seatPrice, color: isSelected ? theme.colors.surface : theme.colors.textMuted }}>
                                                            {s.price ? `Rp ${s.price.toLocaleString('id-ID')}` : '-'}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div style={styles.seatLegend}>
                                            <div style={styles.seatLegendItem}><div style={{ ...styles.seatLegendColor, backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}></div> Tersedia</div>
                                            <div style={styles.seatLegendItem}><div style={{ ...styles.seatLegendColor, backgroundColor: theme.colors.background, opacity: 0.6 }}></div> Terisi</div>
                                            <div style={styles.seatLegendItem}><div style={{ ...styles.seatLegendColor, backgroundColor: theme.colors.primary }}></div> Dipilih</div>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" style={styles.modalSubmit} disabled={loading}>{loading ? 'Menyimpan...' : (editingFlight ? 'Simpan Perubahan' : 'Simpan')}</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', fontFamily: theme.fonts.primary },

    // Sidebar
    sidebar: {
        width: '260px',
        background: `linear-gradient(180deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 100%)`,
        color: theme.colors.surface,
        display: 'flex',
        flexDirection: 'column',
        padding: '25px 15px',
        flexShrink: 0
    },
    sidebarLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        fontSize: theme.typography.xl,
        fontWeight: theme.fontWeights.bold,
        padding: '0 10px 25px',
        borderBottom: `1px solid ${theme.colors.surface}20`,
        marginBottom: '25px'
    },
    sidebarNav: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: '12px 15px',
        border: 'none',
        color: `${theme.colors.surface}80`,
        cursor: 'pointer',
        borderRadius: theme.radius.lg,
        fontSize: theme.typography.sm,
        fontWeight: theme.fontWeights.semibold,
        transition: 'all 0.2s'
    },
    sidebarFooter: { borderTop: `1px solid ${theme.colors.surface}20`, paddingTop: theme.spacing.lg },
    sidebarUser: {
        fontSize: theme.typography.xs,
        color: `${theme.colors.surface}60`,
        marginBottom: theme.spacing.sm,
        padding: '0 10px'
    },
    sidebarLogout: {
        width: '100%',
        padding: theme.spacing.sm,
        border: `1px solid ${theme.colors.surface}40`,
        background: 'transparent',
        color: theme.colors.surface,
        borderRadius: theme.radius.lg,
        cursor: 'pointer',
        fontWeight: theme.fontWeights.semibold
    },

    // Main
    main: {
        flex: 1,
        padding: '30px 40px',
        backgroundColor: theme.colors.background,
        overflowY: 'auto'
    },
    pageTitle: {
        fontSize: theme.typography['2xl'],
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing['2xl']
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing['2xl']
    },

    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: theme.spacing.lg },
    statCard: {
        ...ui.card.base,
        padding: theme.spacing['2xl'],
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.lg
    },
    statIcon: {
        width: '56px',
        height: '56px',
        borderRadius: theme.radius.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statValue: {
        fontSize: theme.typography['3xl'],
        fontWeight: theme.fontWeights.black,
        color: theme.colors.text
    },
    statLabel: {
        fontSize: theme.typography.sm,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.semibold
    },

    // Table
    table: {
        ...ui.card.base,
        overflow: 'hidden'
    },
    tableHeader: {
        display: 'flex',
        padding: '15px 25px',
        backgroundColor: theme.colors.background,
        fontWeight: theme.fontWeights.bold,
        fontSize: theme.typography.sm,
        color: theme.colors.textMuted,
        borderBottom: `1px solid ${theme.colors.border}`
    },
    tableRow: {
        display: 'flex',
        padding: '15px 25px',
        borderBottom: `1px solid ${theme.colors.border}`,
        alignItems: 'center',
        fontSize: theme.typography.sm,
        color: theme.colors.text
    },
    emptyTable: {
        padding: theme.spacing['3xl'],
        textAlign: 'center',
        color: theme.colors.textMuted
    },
    statusTag: {
        backgroundColor: `${theme.colors.primary}20`,
        color: theme.colors.primary,
        padding: '3px 10px',
        borderRadius: theme.radius['2xl'],
        fontSize: theme.typography.xs,
        fontWeight: theme.fontWeights.bold
    },

    // Buttons
    addBtn: { ...ui.button.primary },
    deleteBtn: { ...ui.button.danger },
    editBtn: { ...ui.button.secondary },

    // Modal
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        ...ui.card.base,
        padding: theme.spacing['2xl'],
        width: '90%',
        maxWidth: '450px',
        boxShadow: theme.shadows['2xl']
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing['2xl']
    },
    modalForm: { display: 'flex', flexDirection: 'column', gap: theme.spacing.md },
    formRow: { display: 'flex', gap: theme.spacing.md },
    modalInput: { ...ui.input.base },
    modalSubmit: { ...ui.button.primary },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: theme.colors.textMuted
    },

    // Seat Selection
    seatSection: {
        marginTop: theme.spacing.lg,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`
    },
    seatSectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg
    },
    seatSectionTitle: {
        fontSize: theme.typography.base,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
        margin: 0
    },
    seatBadge: {
        backgroundColor: `${theme.colors.primary}20`,
        color: theme.colors.primary,
        padding: '4px 12px',
        borderRadius: theme.radius['2xl'],
        fontSize: theme.typography.xs,
        fontWeight: theme.fontWeights.bold
    },
    seatGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg
    },
    seat: {
        padding: '10px 5px',
        borderRadius: theme.radius.md,
        textAlign: 'center',
        fontWeight: theme.fontWeights.bold,
        fontSize: theme.typography.xs,
        transition: 'all 0.2s',
        border: `1px solid ${theme.colors.border}`
    },
    seatPrice: {
        fontSize: theme.typography.xs,
        fontWeight: theme.fontWeights.normal,
        marginTop: '2px'
    },
    seatLegend: {
        display: 'flex',
        gap: theme.spacing.md,
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    seatLegendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
        fontSize: theme.typography.xs,
        color: theme.colors.textMuted
    },
    seatLegendColor: {
        width: '12px',
        height: '12px',
        borderRadius: theme.radius.sm,
        border: `1px solid ${theme.colors.border}`
    },
};

export default AdminPanel;
