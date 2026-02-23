import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plane, MapPin, Calendar, Search, ArrowRightLeft, Users, Ticket, ChevronRight, X, SlidersHorizontal, ArrowUpDown, User, Star, CheckCircle, Tag, Shield, Clock, Headphones, CreditCard, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { theme, ui } from '../../theme';
import BookingView from './BookingView';
import BookingHistory from './BookingHistory';
import UserProfile from './UserProfile';
import { FlightReviews } from '../reviews/ReviewForm';
import useIsMobile from '../../hooks/useIsMobile';

const tokens = {
    // Legacy support
    hero: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #7c3aed 100%)',
    brandGradient: theme.colors.primaryGradient,
    textOnHero: 'rgba(255,255,255,0.92)',
    glass: 'rgba(255,255,255,0.16)',
    glassBorder: 'rgba(255,255,255,0.22)',
    // New Landing Page tokens
    colors: {
        bg: '#f5f7f9',
        surface: '#ffffff',
        text: '#0f172a',
        muted: '#64748b',
        border: 'rgba(148,163,184,0.25)',
        brand: '#0194f3',
        brandDark: '#0066cc',
        accent: '#ff5e1f',
        hero: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #7c3aed 100%)',
        brandGradient: 'linear-gradient(135deg, #0194f3 0%, #0066cc 100%)',
    },
    radius: { sm: 12, md: 16, lg: 22, pill: 999 },
    shadow: {
        sm: '0 4px 12px rgba(15, 23, 42, 0.08)',
        md: '0 16px 40px rgba(15, 23, 42, 0.14)',
        lg: '0 24px 70px rgba(15, 23, 42, 0.22)',
    }
};

const DESTINATIONS = [
    { name: 'Tokyo', country: 'Jepang', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', price: 'Rp 3.500.000', airportCode: 'NRT', airportName: 'Narita International Airport' },
    { name: 'Paris', country: 'Prancis', image: 'https://images.unsplash.com/photo-1502602898657-3e94160690c3?w=400', price: 'Rp 8.200.000', airportCode: 'CDG', airportName: 'Charles de Gaulle Airport' },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', price: 'Rp 1.200.000', airportCode: 'DPS', airportName: 'Ngurah Rai International Airport' },
    { name: 'New York', country: 'Amerika Serikat', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0f62e6e9?w=400', price: 'Rp 12.500.000', airportCode: 'JFK', airportName: 'John F. Kennedy International Airport' },
];

const layout = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
}

// Searchable airport combobox - defined outside to prevent re-creation on every render
const SearchableAirportSelect = ({ label, value, onChange, airports, placeholder }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        if (value) {
            const found = airports.find(a => a.iataAirportCode === value);
            if (found) setDisplayValue(`${found.city} (${found.iataAirportCode})`);
            else setDisplayValue(value);
        } else {
            setDisplayValue('');
        }
    }, [value, airports]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query.trim() === ''
        ? airports
        : airports.filter(a =>
            a.city?.toLowerCase().includes(query.toLowerCase()) ||
            a.iataAirportCode?.toLowerCase().includes(query.toLowerCase()) ||
            a.name?.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = (airport) => {
        onChange(airport.iataAirportCode);
        setDisplayValue(`${airport.city} (${airport.iataAirportCode})`);
        setQuery('');
        setOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setDisplayValue('');
        setQuery('');
    };

    // We can't use 'styles' here since it's defined inside FlightSearch, so use inline
    const inputStyle = {
        width: '100%',
        padding: '12px 36px 12px 14px',
        border: open ? '2px solid #0194f3' : '1.5px solid #e2e8f0',
        borderRadius: 12,
        fontSize: 15,
        outline: 'none',
        background: '#fff',
        cursor: 'text',
        color: '#0f172a',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'border 0.18s',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }} ref={ref}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} /> {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={open ? query : displayValue}
                    onFocus={() => { setOpen(true); setQuery(''); }}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    style={inputStyle}
                />
                {displayValue && !open && (
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#aaa', display: 'flex', alignItems: 'center', padding: 3
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.16 }}
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 5px)',
                                left: 0,
                                right: 0,
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 14,
                                boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
                                zIndex: 200,
                                maxHeight: '250px',
                                overflowY: 'auto',
                            }}
                        >
                            {filtered.length === 0 ? (
                                <div style={{ padding: '14px 18px', color: '#94a3b8', fontSize: 13 }}>Bandara tidak ditemukan</div>
                            ) : filtered.map((airport, i) => (
                                <div
                                    key={airport.iataAirportCode}
                                    onMouseDown={() => handleSelect(airport)}
                                    style={{
                                        padding: '10px 18px',
                                        cursor: 'pointer',
                                        borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        minWidth: 44, textAlign: 'center',
                                        fontWeight: 800, fontSize: 13,
                                        color: '#0194f3',
                                        background: 'rgba(1,148,243,0.08)',
                                        borderRadius: 8, padding: '4px 6px'
                                    }}>
                                        {airport.iataAirportCode}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{airport.city}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{airport.name}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};



const FlightSearch = ({ onLogout, user, token, onUserUpdate }) => {
    const isMobile = useIsMobile();
    const [airports, setAirports] = useState([]);
    const [destinationOptions, setDestinationOptions] = useState([]); // Filtered destinations
    const [searchParams, setSearchParams] = useState({
        origin: '',
        destination: '',
        date: new Date().toISOString().split('T')[0],
        returnDate: '',
        passengers: 1,
        tripType: 'oneway' // 'oneway' | 'roundtrip'
    });
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Filter & Sort state
    const [sortBy, setSortBy] = useState('default'); // 'price_asc' | 'price_desc' | 'time_asc' | 'time_desc'
    const [filterAirline, setFilterAirline] = useState('all');
    const [filterTime, setFilterTime] = useState('all'); // 'morning' | 'afternoon' | 'evening' | 'night'
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAirports();
    }, []);

    const fetchAirports = async () => {
        try {
            const res = await axios.get('http://localhost:3333/api/airports');
            setAirports(res.data);
            setDestinationOptions(res.data); // Default show all
        } catch (err) {
            console.error("Gagal load bandara", err);
        }
    };

    // Filter valid destinations when origin changes
    useEffect(() => {
        if (searchParams.origin) {
            axios.get(`http://localhost:3333/api/airports?from=${searchParams.origin}`)
                .then(res => {
                    setDestinationOptions(res.data);
                    // Clear destination if currently selected one is not in the new list
                    const validCodes = res.data.map(a => a.iataAirportCode);
                    if (searchParams.destination && !validCodes.includes(searchParams.destination)) {
                        setSearchParams(prev => ({ ...prev, destination: '' }));
                    }
                })
                .catch(err => {
                    console.error("Gagal filter rute", err);
                    setDestinationOptions(airports); // Fallback to all
                });
        } else {
            setDestinationOptions(airports); // Reset if no origin
        }
    }, [searchParams.origin]); // Dependency only origin to avoid loop



    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowFilters(false);
        setHasSearched(true);
        try {
            const res = await axios.get('http://localhost:3333/api/flights', {
                params: {
                    origin: searchParams.origin,
                    destination: searchParams.destination
                }
            });
            setFlights(res.data);
        } catch (err) {
            console.error("Gagal cari penerbangan:", err);
        } finally {
            setLoading(false);
        }
    };

    // Derive airline list from results
    const airlineList = [...new Set(flights.map(f => f.flightCall.replace(/\d+/, '')))].filter(Boolean);

    // Time filter helper
    const getHourFromFlight = (f) => {
        const t = f.schedule?.departureTimeGmt;
        if (!t) return 12;
        return new Date(t).getUTCHours();
    };

    // Apply filter + sort
    const filteredFlights = flights
        .filter(f => {
            if (filterAirline !== 'all') {
                const airline = f.flightCall.replace(/\d+/, '');
                if (airline !== filterAirline) return false;
            }
            if (filterTime !== 'all') {
                const h = getHourFromFlight(f);
                if (filterTime === 'morning' && !(h >= 5 && h < 12)) return false;
                if (filterTime === 'afternoon' && !(h >= 12 && h < 17)) return false;
                if (filterTime === 'evening' && !(h >= 17 && h < 21)) return false;
                if (filterTime === 'night' && !(h >= 21 || h < 5)) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'time_asc') return getHourFromFlight(a) - getHourFromFlight(b);
            if (sortBy === 'time_desc') return getHourFromFlight(b) - getHourFromFlight(a);
            // For price sort, use flight call as proxy (we don't have price in list)
            if (sortBy === 'price_asc') return a.flightCall.localeCompare(b.flightCall);
            if (sortBy === 'price_desc') return b.flightCall.localeCompare(a.flightCall);
            return 0;
        });

    const activeFiltersCount = [filterAirline !== 'all', filterTime !== 'all'].filter(Boolean).length;

    const swapStations = () => {
        setSearchParams(prev => ({
            ...prev,
            origin: prev.destination,
            destination: prev.origin
        }));
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    if (showProfile) {
        return (
            <UserProfile
                user={user}
                token={token}
                onBack={() => setShowProfile(false)}
                onUserUpdate={onUserUpdate}
            />
        );
    }

    if (showHistory) {
        return (
            <div style={styles.container}>
                <nav style={styles.nav}>
                    <div style={styles.navInner}>
                        <div style={styles.logo}>
                            <Plane size={24} color="#0194f3" strokeWidth={3} />
                            <span style={styles.logoText}>FlightBooking</span>
                        </div>
                        <div style={styles.navRight}>
                            <button onClick={() => setShowProfile(true)} style={styles.historyBtn}><User size={16} /> Profil</button>
                            <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
                        </div>
                    </div>
                </nav>
                <BookingHistory user={user} onBack={() => setShowHistory(false)} />
            </div>
        )
    }

    if (selectedFlight) {
        return (
            <div style={styles.container}>
                <nav style={styles.nav}>
                    <div style={styles.navInner}>
                        <div style={styles.logo}>
                            <Plane size={24} color="#0194f3" strokeWidth={3} />
                            <span style={styles.logoText}>FlightBooking</span>
                        </div>
                        <div style={styles.navRight}>
                            <button onClick={() => setShowHistory(true)} style={styles.historyBtn}>
                                <Ticket size={16} /> Riwayat Pesanan
                            </button>
                            <button onClick={() => setShowProfile(true)} style={styles.historyBtn}><User size={16} /> Profil</button>
                            <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
                        </div>
                    </div>
                </nav>
                <BookingView
                    flight={selectedFlight}
                    user={user}
                    passengersCount={searchParams.passengers}
                    onBack={() => setSelectedFlight(null)}
                />
            </div>
        )
    }

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.logo}>
                        <Plane size={24} color="#0194f3" strokeWidth={3} />
                        <span style={styles.logoText}>FlightBooking</span>
                    </div>
                    <div style={styles.navRight}>
                        <span style={{ ...styles.userName, display: isMobile ? 'none' : 'inline' }}>Halo, {user?.fullName}</span>
                        <button onClick={() => setShowHistory(true)} style={styles.historyBtn}>
                            <Ticket size={16} />
                            <span style={{ display: isMobile ? 'none' : 'inline' }}> Riwayat</span>
                        </button>
                        <button onClick={() => setShowProfile(true)} style={styles.historyBtn}>
                            <User size={16} />
                            <span style={{ display: isMobile ? 'none' : 'inline' }}> Profil</span>
                        </button>
                        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ ...styles.hero, padding: isMobile ? '60px 16px 120px' : '88px 0 150px' }}>
                <div aria-hidden style={styles.heroAccents}>
                    <div style={styles.heroBlobLeft} />
                    <div style={styles.heroBlobRight} />
                    <div style={styles.heroGlow} />
                </div>
                <div style={styles.heroInner}>
                    <h1 style={styles.heroTitle}>Temukan Petualangan Anda Berikutnya</h1>
                    <p style={styles.heroSubtitle}>Bandingkan dan pesan tiket pesawat dengan harga terbaik di seluruh dunia.</p>
                </div>
            </header>

            {/* Search Box */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    ...styles.searchBox,
                    margin: isMobile ? '-80px 16px 32px' : '-104px auto 44px',
                    padding: isMobile ? '20px 16px' : theme.spacing['2xl'],
                }}
            >
                {/* Trip Type Toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                    {['oneway', 'roundtrip'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setSearchParams({ ...searchParams, tripType: type })}
                            style={{
                                padding: '7px 20px',
                                borderRadius: 999,
                                border: searchParams.tripType === type ? '2px solid #0194f3' : '1.5px solid #e2e8f0',
                                background: searchParams.tripType === type ? '#0194f3' : '#fff',
                                color: searchParams.tripType === type ? '#fff' : '#64748b',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
                            }}
                        >
                            {type === 'oneway' ? '✈ Sekali Jalan' : '↔ Pulang-Pergi'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <div style={{ ...styles.formRow, flexDirection: isMobile ? 'column' : 'row' }}>
                        {/* Origin */}
                        <SearchableAirportSelect
                            label="Dari mana?"
                            value={searchParams.origin}
                            onChange={(val) => setSearchParams({ ...searchParams, origin: val })}
                            airports={airports}
                            placeholder="Ketik kota atau kode bandara..."
                        />
                        <button type="button" onClick={swapStations} style={styles.swapBtn}>
                            <ArrowRightLeft size={16} color="#0194f3" />
                        </button>
                        {/* Destination */}
                        <SearchableAirportSelect
                            label="Ke mana?"
                            value={searchParams.destination}
                            onChange={(val) => setSearchParams({ ...searchParams, destination: val })}
                            airports={destinationOptions}
                            placeholder={searchParams.origin ? "Pilih tujuan..." : "Pilih asal dulu"}
                            disabled={!searchParams.origin}
                        />
                    </div>

                    <div style={{ ...styles.formRow, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                        {/* Date Pergi */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}><Calendar size={14} /> Tanggal Pergi</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={searchParams.date}
                                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                            />
                        </div>

                        {/* Date Pulang (hanya tampil jika round trip) */}
                        {searchParams.tripType === 'roundtrip' && (
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}><Calendar size={14} /> Tanggal Pulang</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={searchParams.returnDate}
                                    min={searchParams.date}
                                    onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Passengers */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}><Users size={14} /> Penumpang</label>
                            <input
                                type="number"
                                min="1"
                                max="9"
                                style={styles.input}
                                value={searchParams.passengers}
                                onChange={(e) => setSearchParams({ ...searchParams, passengers: e.target.value })}
                            />
                        </div>

                        {/* Submit */}
                        <button type="submit"
                            style={{
                                ...styles.searchBtn,
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: 'center',
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Mencari...' : <><Search size={20} /> Cari Tiket</>}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Results Section */}
            <div style={styles.resultsContainer}>
                {!hasSearched && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        {/* Stats strip */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 14,
                            margin: '40px auto 60px',
                            maxWidth: 980
                        }}>
                            {[{ value: '2.5K+', label: 'Penerbangan / hari' }, { value: '120+', label: 'Bandara terhubung' }, { value: '24/7', label: 'Customer support' }, { value: '4.9/5', label: 'Rating pengguna' }].map((item) => (
                                <div key={item.label} style={{
                                    background: '#fff',
                                    border: '1px solid ' + tokens.colors.border,
                                    borderRadius: tokens.radius.md,
                                    padding: '18px 20px',
                                    boxShadow: tokens.shadow.sm,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: tokens.colors.brandDark }}>{item.value}</div>
                                    <div style={{ fontSize: 13, color: tokens.colors.muted, marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features Section */}
                        <div style={{ marginBottom: 80, padding: isMobile ? '0 20px' : 0 }}>
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: tokens.colors.text, margin: 0 }}>Mengapa Memilih Kami</h2>
                                <p style={{ color: tokens.colors.muted, marginTop: 8, fontSize: '1.05rem' }}>Pengalaman booking yang cepat, aman, dan nyaman.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                                {[
                                    { icon: <Shield size={40} />, title: 'Aman & Terpercaya', desc: 'Sistem pembayaran yang aman dan data pribadi terlindungi' },
                                    { icon: <Clock size={40} />, title: 'Cepat & Mudah', desc: 'Proses pemesanan tiket hanya dalam beberapa menit' },
                                    { icon: <Headphones size={40} />, title: 'Support 24/7', desc: 'Tim customer service siap membantu kapan saja' },
                                    { icon: <CreditCard size={40} />, title: 'Harga Terbaik', desc: 'Dapatkan harga tiket pesawat termurah di sini' }
                                ].map((feature, i) => (
                                    <div key={i} style={{
                                        background: tokens.colors.surface,
                                        border: `1px solid ${tokens.colors.border}`,
                                        borderRadius: tokens.radius.md,
                                        padding: '30px',
                                        boxShadow: tokens.shadow.sm,
                                        transition: 'transform 0.2s',
                                        cursor: 'default'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ width: 50, height: 50, background: 'rgba(1,148,243,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.brand, marginBottom: 16 }}>
                                            {feature.icon}
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: tokens.colors.text, marginBottom: 10 }}>{feature.title}</h3>
                                        <p style={{ color: tokens.colors.muted, lineHeight: 1.6, fontSize: '0.95rem' }}>{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Destinations Section */}
                        <div style={{ marginBottom: 60, padding: isMobile ? '0 20px' : 0 }}>
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: tokens.colors.text, margin: 0 }}>Destinasi Populer</h2>
                                <p style={{ color: tokens.colors.muted, marginTop: 8, fontSize: '1.05rem' }}>Inspirasi perjalanan untuk rencana liburan berikutnya.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                                {DESTINATIONS.map((destination, index) => (
                                    <div key={index}
                                        onClick={() => setSearchParams(prev => ({ ...prev, destination: destination.airportCode }))}
                                        style={{
                                            background: tokens.colors.surface,
                                            borderRadius: tokens.radius.md,
                                            overflow: 'hidden',
                                            border: `1px solid ${tokens.colors.border}`,
                                            boxShadow: tokens.shadow.sm,
                                            cursor: 'pointer',
                                            position: 'relative',
                                            height: 220,
                                            transition: 'transform 0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <img src={destination.image} alt={destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent 60%)' }} />
                                        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: tokens.colors.brand }}>
                                            {destination.price}
                                        </div>
                                        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                                            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{destination.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{destination.country}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {hasSearched && flights.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                        <div style={{ background: '#f1f5f9', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Search size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Penerbangan tidak ditemukan</h3>
                        <p style={{ marginTop: 8 }}>Coba ganti tanggal atau rute pencarian Anda.</p>
                    </div>
                )}

                {hasSearched && flights.length > 0 && (
                    <>
                        {/* Filter & Sort Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>
                                    {filteredFlights.length} penerbangan ditemukan
                                </span>
                                {activeFiltersCount > 0 && (
                                    <span style={{ background: '#0194f3', color: '#fff', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                                        {activeFiltersCount} filter aktif
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {/* Filter button */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 16px', borderRadius: 10,
                                        border: showFilters ? '2px solid #0194f3' : '1.5px solid #e2e8f0',
                                        background: showFilters ? '#e8f4ff' : '#fff',
                                        color: showFilters ? '#0194f3' : '#64748b',
                                        cursor: 'pointer', fontWeight: 700, fontSize: 13
                                    }}
                                >
                                    <SlidersHorizontal size={15} /> Filter
                                </button>
                                {/* Sort dropdown */}
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    style={{
                                        padding: '8px 14px', borderRadius: 10,
                                        border: '1.5px solid #e2e8f0', background: '#fff',
                                        color: '#64748b', fontWeight: 700, fontSize: 13,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="default">↕ Urutkan</option>
                                    <option value="time_asc">⏰ Paling Awal</option>
                                    <option value="time_desc">🌙 Paling Akhir</option>
                                    <option value="price_asc">💰 Harga: Rendah</option>
                                    <option value="price_desc">💎 Harga: Tinggi</option>
                                </select>
                                {/* Reset filters */}
                                {(filterAirline !== 'all' || filterTime !== 'all' || sortBy !== 'default') && (
                                    <button
                                        onClick={() => { setFilterAirline('all'); setFilterTime('all'); setSortBy('default'); }}
                                        style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #fca5a5', background: '#fff7f7', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 12, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                                        {/* Maskapai filter */}
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 10 }}>Maskapai</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {['all', ...airlineList].map(a => (
                                                    <button key={a} onClick={() => setFilterAirline(a)} style={{
                                                        padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                                        border: filterAirline === a ? '2px solid #0194f3' : '1.5px solid #e2e8f0',
                                                        background: filterAirline === a ? '#0194f3' : '#f8fafc',
                                                        color: filterAirline === a ? '#fff' : '#64748b', cursor: 'pointer'
                                                    }}>
                                                        {a === 'all' ? 'Semua' : a}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Waktu filter */}
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 10 }}>Waktu Berangkat</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {[
                                                    { key: 'all', label: 'Semua' },
                                                    { key: 'morning', label: '🌅 Pagi (05-12)' },
                                                    { key: 'afternoon', label: '☀️ Siang (12-17)' },
                                                    { key: 'evening', label: '🌆 Sore (17-21)' },
                                                    { key: 'night', label: '🌙 Malam (21-05)' },
                                                ].map(t => (
                                                    <button key={t.key} onClick={() => setFilterTime(t.key)} style={{
                                                        padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                                        border: filterTime === t.key ? '2px solid #0194f3' : '1.5px solid #e2e8f0',
                                                        background: filterTime === t.key ? '#0194f3' : '#f8fafc',
                                                        color: filterTime === t.key ? '#fff' : '#64748b', cursor: 'pointer'
                                                    }}>
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Flight Cards */}
                        {filteredFlights.length === 0 ? (
                            <div style={styles.noData}>
                                <SlidersHorizontal size={48} color="#ccc" />
                                <p>Tidak ada penerbangan sesuai filter. Coba ubah filter Anda.</p>
                            </div>
                        ) : filteredFlights.map(flight => (
                            (() => {
                                const schedule = flight.schedule;
                                const origin = schedule?.originAirport;
                                const dest = schedule?.destinationAirport;
                                const departTime = formatTime(schedule?.departureTimeGmt) || '08:00';
                                const arriveTime = formatTime(schedule?.arrivalTimeGmt) || '10:00';
                                const originCode = origin?.iataAirportCode || schedule?.originAirport?.iataAirportCode;
                                const destCode = dest?.iataAirportCode || schedule?.destinationAirport?.iataAirportCode;
                                const originCity = origin?.city;
                                const destCity = dest?.city;
                                const airline = flight.flightCall.replace(/\d+/, '');

                                return (
                                    <React.Fragment key={flight.flightCall}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            style={styles.flightCard}
                                            whileHover={{ transform: 'translateY(-4px)', boxShadow: theme.shadows['2xl'] }}
                                        >
                                            <div style={{
                                                ...styles.flightMain,
                                                flexDirection: isMobile ? 'column' : 'row',
                                                gap: isMobile ? 16 : undefined,
                                            }}>
                                                <div style={styles.airlineInfo}>
                                                    <div style={styles.planeIcon}><Plane size={22} color="#fff" /></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <div style={styles.flightNo}>{flight.flightCall}</div>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                            <span style={styles.chip}>{flight.status?.name || 'Scheduled'}</span>
                                                            {originCity && destCity && (
                                                                <span style={styles.chipSoft}>{originCity} → {destCity}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={styles.routeContainer}>
                                                    <div style={styles.timePoint}>
                                                        <div style={styles.timeText}>{departTime}</div>
                                                        <div style={styles.airportCode}>{originCode || '-'}</div>
                                                    </div>
                                                    <div style={styles.durationLine}>
                                                        <div style={styles.durationText}>Direct ✈</div>
                                                        <div style={styles.line}></div>
                                                    </div>
                                                    <div style={styles.timePoint}>
                                                        <div style={styles.timeText}>{arriveTime}</div>
                                                        <div style={styles.airportCode}>{destCode || '-'}</div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    ...styles.priceContainer,
                                                    textAlign: isMobile ? 'left' : 'right',
                                                    display: 'flex',
                                                    flexDirection: isMobile ? 'row' : 'column',
                                                    alignItems: isMobile ? 'center' : 'flex-end',
                                                    justifyContent: isMobile ? 'space-between' : undefined,
                                                    flexWrap: 'wrap',
                                                    gap: isMobile ? 8 : 0,
                                                }}>
                                                    <div style={styles.priceLabel}>Mulai dari</div>
                                                    <div style={styles.priceValue}>
                                                        {flight.minPrice
                                                            ? `Rp ${Number(flight.minPrice).toLocaleString('id-ID')}`
                                                            : 'Cek Harga'}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>per orang</div>
                                                    <button
                                                        onClick={() => setSelectedFlight(flight)}
                                                        style={styles.selectBtn}
                                                    >
                                                        Pilih Penerbangan <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                        {/* Mini review display */}
                                        <FlightReviews flightCall={flight.flightCall} />
                                    </React.Fragment>
                                );
                            })()
                        ))}
                    </>
                )}
                {!loading && flights.length === 0 && searchParams.origin && (
                    <div style={styles.noData}>
                        <Search size={48} color="#ccc" />
                        <p>Tidak ada penerbangan ditemukan untuk rute ini.</p>
                    </div>
                )}
            </div>
        </div >
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.primary,
        overflowX: 'hidden',
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        backgroundColor: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.colors.border}`
    },
    navInner: {
        ...layout,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: { display: 'flex', alignItems: 'center', gap: theme.spacing.sm },
    logoText: {
        fontSize: theme.typography['2xl'],
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.primary
    },
    navRight: { display: 'flex', alignItems: 'center', gap: theme.spacing.lg },
    userName: { fontWeight: theme.fontWeights.semibold, color: theme.colors.text },
    logoutBtn: { ...ui.button.secondary },
    historyBtn: { ...ui.button.outline },

    hero: {
        padding: '88px 0 150px',
        background: tokens.hero,
        color: theme.colors.surface,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    heroInner: {
        ...layout,
        position: 'relative',
        zIndex: 1,
    },
    heroAccents: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.95,
    },
    heroBlobLeft: {
        position: 'absolute',
        width: 520,
        height: 520,
        left: -160,
        top: -220,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        filter: 'blur(2px)'
    },
    heroBlobRight: {
        position: 'absolute',
        width: 620,
        height: 620,
        right: -260,
        bottom: -320,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.14)',
        filter: 'blur(2px)'
    },
    heroGlow: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.20), transparent 45%), radial-gradient(circle at 82% 65%, rgba(255,255,255,0.12), transparent 50%)'
    },
    heroTitle: {
        fontSize: theme.typography['4xl'],
        fontWeight: theme.fontWeights.black,
        marginBottom: theme.spacing.md
    },
    heroSubtitle: {
        fontSize: theme.typography.lg,
        opacity: 0.92,
        color: tokens.textOnHero,
        maxWidth: 860,
        margin: '0 auto'
    },

    searchBox: {
        ...layout,
        margin: '-104px auto 44px',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: theme.radius['2xl'],
        padding: theme.spacing['2xl'],
        boxShadow: theme.shadows['2xl'],
        border: '1px solid rgba(255,255,255,0.55)',
        position: 'relative',
        zIndex: 10
    },
    searchForm: { display: 'flex', flexDirection: 'column', gap: theme.spacing.lg },
    formRow: { display: 'flex', gap: theme.spacing.md, alignItems: 'flex-end' },
    inputWrapper: { flex: 1, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    label: {
        fontSize: theme.typography.sm,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.xs
    },
    select: { ...ui.input.base },
    input: { ...ui.input.base },
    swapBtn: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.full,
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: 'rgba(255,255,255,0.95)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: theme.shadows.sm
    },
    searchBtn: {
        ...ui.button.primary,
        padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
        fontSize: theme.typography.base,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        boxShadow: `0 4px 15px ${theme.colors.primary}30`,
        flexShrink: 0
    },

    resultsContainer: {
        ...layout,
        margin: '0 auto 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md
    },
    flightCard: {
        ...ui.card.base,
        padding: theme.spacing.xl,
        borderRadius: theme.radius['2xl'],
        boxShadow: theme.shadows.md,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease'
    },
    flightMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    airlineInfo: { display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1 },
    planeIcon: {
        width: '40px',
        height: '40px',
        background: tokens.brandGradient,
        borderRadius: theme.radius.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    flightNo: {
        fontWeight: theme.fontWeights.bold,
        fontSize: theme.typography.base,
        color: theme.colors.text
    },
    chip: {
        fontSize: theme.typography.xs,
        backgroundColor: `${theme.colors.primary}18`,
        color: theme.colors.primary,
        padding: '4px 10px',
        borderRadius: theme.radius.full,
        fontWeight: theme.fontWeights.bold,
        border: `1px solid ${theme.colors.primary}22`,
        display: 'inline-flex',
        alignItems: 'center'
    },
    chipSoft: {
        fontSize: theme.typography.xs,
        backgroundColor: theme.colors.background,
        color: theme.colors.textMuted,
        padding: '4px 10px',
        borderRadius: theme.radius.full,
        fontWeight: theme.fontWeights.semibold,
        border: `1px solid ${theme.colors.border}`
    },

    routeContainer: { display: 'flex', alignItems: 'center', gap: theme.spacing['2xl'], flex: 2, justifyContent: 'center' },
    timePoint: { textAlign: 'center' },
    timeText: {
        fontSize: theme.typography.xl,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text
    },
    airportCode: {
        fontSize: theme.typography.sm,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.semibold
    },
    durationLine: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' },
    durationText: { fontSize: theme.typography.xs, color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
    line: { width: '100%', height: '2px', backgroundColor: theme.colors.border, position: 'relative' },

    priceContainer: { textAlign: 'right', flex: 1 },
    priceLabel: { fontSize: theme.typography.xs, color: theme.colors.textMuted },
    priceValue: {
        fontSize: theme.typography['2xl'],
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.accent,
        margin: '2px 0 10px'
    },
    selectBtn: { ...ui.button.primary, width: '100%', justifyContent: 'center' },

    noData: {
        textAlign: 'center',
        padding: theme.spacing['3xl'],
        color: theme.colors.textMuted
    }
};


export default FlightSearch;
