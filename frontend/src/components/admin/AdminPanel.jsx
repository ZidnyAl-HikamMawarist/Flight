import React, { useState, useEffect } from 'react';
import { BarChart3, PlaneTakeoff, MapPin, Ticket, Users, Plus, Trash2, ChevronLeft, X, Edit, User, Users2, BarChart2, DollarSign, Search, Download, CheckBox, FileDown } from 'lucide-react';
import Papa from 'papaparse';
import { useToast } from '../../ui/ToastNotification';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend as ChartLegend 
} from 'chart.js';
import { Line as ChartLine } from 'react-chartjs-2';
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
    const [airportPage, setAirportPage] = useState(1);
    const [airportPagination, setAirportPagination] = useState({});
    const [flightPage, setFlightPage] = useState(1);
    const [flightPagination, setFlightPagination] = useState({});
    const [users, setUsers] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [userPagination, setUserPagination] = useState({});
    const [chartData, setChartData] = useState([]);
    const [searchTerm, setSearchTerm] = useState({});
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAirports, setSelectedAirports] = useState([]);
    const [selectedFlights, setSelectedFlights] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const { toast } = useToast();
    const [socket, setSocket] = useState(null);
    const [lang, setLang] = useState('id');
    const [showSettings, setShowSettings] = useState(false);
    const [priceTemplates, setPriceTemplates] = useState({ economy: 750000, premium: 1500000 });

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
        
        const newSocket = io('http://localhost:3333');
        newSocket.on('new_booking', (data) => {
            toast(`New booking: #${data.bookingId}`, 'info');
            if (activeTab === 'bookings') fetchBookings();
        });
        newSocket.on('new_user', () => {
            toast('New user registered!', 'success');
            if (activeTab === 'users') fetchUsers();
        });
        setSocket(newSocket);
        
        return () => newSocket.close();
    }, [toast, activeTab]);

    useEffect(() => {
        if (activeTab === 'airports') fetchAirports(airportPage);
        if (activeTab === 'flights') fetchFlights(flightPage);
        if (activeTab === 'bookings') fetchBookings(1);
        if (activeTab === 'users') fetchUsers(userPage);
    }, [activeTab, airportPage, flightPage, userPage]);

    const fetchUsers = async (page = userPage) => {
        try {
            const res = await axios.get(`http://localhost:3333/api/admin/users?page=${page}&limit=10`);
            setUsers(res.data.data || res.data);
            setUserPagination(res.data.pagination || {});
        } catch (err) { 
            console.error(err);
            setUsers([]);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/admin/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAirports = async (page = airportPage) => {
        try {
            const res = await axios.get(`http://localhost:3333/api/admin/airports?page=${page}&limit=10`);
            setAirports(res.data.data || res.data);
            setAirportPagination(res.data.pagination || {});
        } catch (err) { console.error(err); }
    };

    const fetchFlights = async (page = flightPage) => {
        try {
            const res = await axios.get(`http://localhost:3333/api/admin/flights?page=${page}&limit=10`);
            setFlights(res.data.data || res.data);
            setFlightPagination(res.data.pagination || {});
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async (page = 1) => {
        try {
            const res = await axios.get(`http://localhost:3333/api/admin/bookings?page=${page}&limit=10`);
            setBookings(res.data.data || res.data);
        } catch (err) { 
            console.error('Booking error:', err);
            setBookings([]);
        }
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

    const handleDeleteUser = async (userId) => {
        if (!confirm('Hapus user ini?')) return;
        try {
            await axios.delete(`http://localhost:3333/api/admin/users/${userId}`);
            fetchUsers(userPage);
            fetchStats();
        } catch (err) { alert('Gagal hapus user: ' + err.message); }
    };

    const exportCSV = (type) => {
        let data = [];
        let headers = [];
        
        if (type === 'airports') {
            headers = ['Kode', 'Nama', 'Kota', 'Negara'];
            data = airports.map(ap => [ap.iataAirportCode, ap.name, ap.city, ap.iataCountryCode]);
        } else if (type === 'flights') {
            headers = ['Kode', 'Asal', 'Tujuan', 'Status'];
            data = flights.map(f => [f.flightCall, f.schedule?.originAirport?.iataAirportCode, f.schedule?.destinationAirport?.iataAirportCode, f.status?.name]);
        }
        
        const csv = Papa.unparse({fields: headers, data});
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `admin-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    const t = (key) => lang === 'en' ? en[key] : id[key];
    
    const id = {
        dashboard: 'Dashboard',
        users: 'Pengguna',
        airports: 'Bandara', 
        flights: 'Penerbangan',
        bookings: 'Booking',
        revenue: 'Pendapatan',
        settings: 'Pengaturan',
        lang: 'Bahasa'
    };
    
    const en = {
        dashboard: 'Dashboard',
        users: 'Users',
        airports: 'Airports',
        flights: 'Flights',
        bookings: 'Bookings', 
        revenue: 'Revenue',
        settings: 'Settings',
        lang: 'Language'
    };

    const tabs = [
        { id: 'dashboard', label: t('dashboard'), icon: <BarChart3 size={18} /> },
        { id: 'revenue', label: t('revenue'), icon: <DollarSign size={18} /> },
        { id: 'live-map', label: 'Live Map', icon: <MapPin size={18} /> },
        { id: 'users', label: t('users'), icon: <Users size={18} /> },
        { id: 'airports', label: t('airports'), icon: <MapPin size={18} /> },
        { id: 'flights', label: t('flights'), icon: <PlaneTakeoff size={18} /> },
        { id: 'bookings', label: t('bookings'), icon: <Ticket size={18} /> },
        { id: 'settings', label: t('settings'), icon: <Settings size={18} /> },
    ];

    // FASE 4 Data
    const [liveFlights, setLiveFlights] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

    useEffect(() => {
        // Mock live flight data
        const flightMarkers = [
            { id: 1, position: [ -6.1256, 106.6558 ], popup: 'GA402 CGK→DPS', status: 'On Time' },
            { id: 2, position: [ -8.7482, 115.1673 ], popup: 'ID001 DPS→CGK', status: 'Delayed' },
            { id: 3, position: [ 3.1351, 101.6869 ], popup: 'MH601 KUL→CGK', status: 'Landed' }
        ];
        setLiveFlights(flightMarkers);

        // Mock revenue data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
        const revenue = [120, 190, 300, 500, 200, 300];
        setRevenueData(months.map((month, i) => ({ month, revenue: revenue[i], bookings: Math.floor(revenue[i]/750000) })));
    }, []);

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
                        <div style={{ marginTop: 40 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Pendapatan (jt)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'revenue' && (
                    <div>
                        <h2 style={styles.pageTitle}>Revenue Analytics</h2>
                        <ChartLine data={revenueData} options={{
                            responsive: true,
                            plugins: { title: { display: true, text: 'Monthly Revenue vs Bookings' } }
                        }} />
                    </div>
                )}

                {activeTab === 'live-map' && (
                    <div>
                        <h2 style={styles.pageTitle}>Live Flight Tracking</h2>
                        <div style={{ height: '70vh', width: '100%', marginTop: 20, borderRadius: 12, overflow: 'hidden' }}>
                            <MapContainer center={[-1.2, 110]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {liveFlights.map(flight => (
                                    <Marker key={flight.id} position={flight.position}>
                                        <Popup>
                                            <strong>{flight.popup}</strong><br/>
                                            Status: <span style={{ color: flight.status === 'On Time' ? 'green' : 'orange' }}>{flight.status}</span>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div>
                        <h2 style={styles.pageTitle}>Pengaturan Sistem</h2>
                        <div style={styles.table}>
                            <div style={{ display: 'flex', gap: 20, padding: 20 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Templates Harga:</label>
                                    <input type="number" value={priceTemplates.economy} onChange={(e) => setPriceTemplates({...priceTemplates, economy: parseInt(e.target.value)})} style={styles.modalInput} placeholder="Economy" />
                                    <input type="number" value={priceTemplates.premium} onChange={(e) => setPriceTemplates({...priceTemplates, premium: parseInt(e.target.value)})} style={styles.modalInput} placeholder="Premium" />
                                </div>
                                <button style={styles.modalSubmit} onClick={() => toast('Settings disimpan!', 'success')}>Simpan</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Airports Tab */}
                {activeTab === 'airports' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <h2 style={styles.pageTitle}>Manajemen Bandara</h2>
                            <div style={{display: 'flex', gap: 8}}>
                                <button onClick={() => setShowModal('airport')} style={styles.addBtn}><Plus size={18} /> Tambah</button>
                                <button onClick={() => exportCSV('airports')} style={{...styles.addBtn, backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0'}}><FileDown size={18} /> CSV</button>
                            </div>
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
                            {airportPagination.last_page > 1 && (
                                <div style={styles.pagination}>
                                    <button 
                                        onClick={() => setAirportPage(p => Math.max(1, p-1))}
                                        disabled={airportPage === 1}
                                        style={styles.pageBtn}
                                    >
                                        Sebelumnya
                                    </button>
                                    <span style={styles.pageInfo}>
                                        Hal {airportPage} dari {airportPagination.last_page || 1}
                                    </span>
                                    <button 
                                        onClick={() => setAirportPage(p => Math.min(airportPagination.last_page || 1, p+1))}
                                        disabled={airportPage === (airportPagination.last_page || 1)}
                                        style={styles.pageBtn}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Flights Tab */}
                {activeTab === 'flights' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <h2 style={styles.pageTitle}>Manajemen Penerbangan</h2>
                            <div style={{display: 'flex', gap: 8}}>
                                <button onClick={() => setShowModal('flight')} style={styles.addBtn}><Plus size={18} /> Tambah</button>
                                <button onClick={() => exportCSV('flights')} style={{...styles.addBtn, backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0'}}><FileDown size={18} /> CSV</button>
                            </div>
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
                        <div style={styles.pagination}>
                            <button style={styles.pageBtn} disabled>Sebelumnya</button>
                            <span style={styles.pageInfo}>Halaman 1</span>
                            <button style={styles.pageBtn} disabled>Selanjutnya</button>
                        </div>
                    </div>
                )}
                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                            <div style={styles.pageHeader}>
                                <h2 style={styles.pageTitle}>Manajemen Pengguna</h2>
                                {selectedUsers.length > 0 && (
                                    <button style={styles.deleteBtn} onClick={() => {
                                        if (confirm(`Hapus ${selectedUsers.length} user?`)) {
                                            Promise.all(selectedUsers.map(id => axios.delete(`http://localhost:3333/api/admin/users/${id}`)))
                                            .then(() => {
                                                toast(`${selectedUsers.length} user terhapus!`, 'success');
                                                fetchUsers();
                                                setSelectedUsers([]);
                                            })
                                            .catch(() => toast('Gagal hapus user', 'error'));
                                        }
                                    }}>
                                        Hapus Terpilih ({selectedUsers.length})
                                    </button>
                                )}
                            </div>
                        <div style={styles.table}>
                            <div style={styles.tableHeader}>
                                <span style={{ flex: 0.5 }}>#</span>
                                <span style={{ flex: 2 }}>Nama</span>
                                <span style={{ flex: 2 }}>Email</span>
                                <span style={{ flex: 1 }}>Role</span>
                                <span style={{ flex: 1 }}>Dibuat</span>
                                <span style={{ flex: 1 }}>Aksi</span>
                            </div>
                            {users.map((u, i) => (
                                <div key={u.id} style={styles.tableRow}>
                                    <span style={{ flex: 0.5, fontWeight: 800 }}># {u.id}</span>
                                    <span style={{ flex: 2 }}>{u.fullName}</span>
                                    <span style={{ flex: 2 }}>{u.email}</span>
                                    <span style={{ flex: 1 }}>
                                        <span style={{
                                            ...styles.statusTag,
                                            backgroundColor: u.role === 'admin' ? `${theme.colors.success}20` : `${theme.colors.warning}20`,
                                            color: u.role === 'admin' ? theme.colors.success : theme.colors.warning
                                        }}>
                                            {u.role}
                                        </span>
                                    </span>
                                    <span style={{ flex: 1 }}>{formatDate(u.createdAt)}</span>
                                    <span style={{ flex: 1 }}>
                                        <button style={styles.editBtn} title="Edit Role">Edit</button>
                                        <button onClick={() => handleDeleteUser(u.id)} style={styles.deleteBtn} title="Hapus User">Hapus</button>
                                    </span>
                                </div>
                            ))}
                        </div>
                        {userPagination.last_page > 1 && (
                            <div style={styles.pagination}>
                                <button onClick={() => setUserPage(p => Math.max(1, p-1))} disabled={userPage === 1} style={styles.pageBtn}>Sebelumnya</button>
                                <span style={styles.pageInfo}>Hal {userPage} dari {userPagination.last_page}</span>
                                <button onClick={() => setUserPage(p => Math.min(userPagination.last_page || 1, p+1))} disabled={userPage === (userPagination.last_page || 1)} style={styles.pageBtn}>Selanjutnya</button>
                            </div>
                        )}
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
            position: 'fixed',
            top: 0,
            left: 0,
            width: '260px',
            height: '100vh',
            background: `linear-gradient(180deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 100%)`,
            color: theme.colors.surface,
            display: 'flex',
            flexDirection: 'column',
            padding: '25px 15px',
            flexShrink: 0,
            zIndex: 40,
            overflowY: 'auto'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            padding: 20,
            backgroundColor: theme.colors.background,
            borderTop: `1px solid ${theme.colors.border}`
        },
        pageBtn: {
            ...ui.button.secondary,
            padding: '8px 16px',
            fontSize: theme.typography.sm
        },
        pageInfo: {
            fontSize: theme.typography.sm,
            color: theme.colors.textMuted,
            fontWeight: theme.fontWeights.medium
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
        marginLeft: 260,
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
