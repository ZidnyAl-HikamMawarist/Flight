import React, { useState, useRef, useEffect } from 'react';
import { Plane, Search, MapPin, Calendar, Users, Star, ChevronRight, Shield, Clock, Headphones, CreditCard, Facebook, Twitter, Instagram, Mail, Phone, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const tokens = {
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

const styles = {
    page: {
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: tokens.colors.bg,
        color: tokens.colors.text,
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
    },
    section: {
        padding: '96px 0',
    },
    sectionHeader: {
        maxWidth: '760px',
        margin: '0 auto 44px',
        textAlign: 'center',
    },
    h2: {
        fontSize: '2.4rem',
        fontWeight: 850,
        letterSpacing: '-0.02em',
        margin: 0,
    },
    subtitle: {
        fontSize: '1.05rem',
        color: tokens.colors.muted,
        lineHeight: 1.7,
        margin: '12px 0 0',
    },
    pill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: tokens.radius.pill,
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.22)',
        color: '#fff',
        fontWeight: 650,
        fontSize: 13,
        letterSpacing: '0.01em',
    },
    buttonPrimary: {
        background: tokens.colors.brandGradient,
        color: '#fff',
        border: 'none',
        borderRadius: tokens.radius.md,
        padding: '14px 18px',
        fontSize: 15,
        fontWeight: 750,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: tokens.shadow.sm,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        userSelect: 'none',
    },
    buttonGhost: {
        background: 'rgba(255,255,255,0.12)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.24)',
        borderRadius: tokens.radius.md,
        padding: '12px 16px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        userSelect: 'none',
    },
    card: {
        background: tokens.colors.surface,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.md,
        boxShadow: tokens.shadow.sm,
    },
};

// Popular destinations mapped to IATA codes
const DESTINATIONS = [
    { name: 'Tokyo', country: 'Jepang', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', price: 'Rp 3.500.000', airportCode: 'NRT', airportName: 'Narita International Airport' },
    { name: 'Paris', country: 'Prancis', image: 'https://images.unsplash.com/photo-1502602898657-3e94160690c3?w=400', price: 'Rp 8.200.000', airportCode: 'CDG', airportName: 'Charles de Gaulle Airport' },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', price: 'Rp 1.200.000', airportCode: 'DPS', airportName: 'Ngurah Rai International Airport' },
    { name: 'New York', country: 'Amerika Serikat', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0f62e6e9?w=400', price: 'Rp 12.500.000', airportCode: 'JFK', airportName: 'John F. Kennedy International Airport' },
];

// Combobox component for searchable dropdown
const CityCombobox = ({ value, onChange, placeholder, icon }) => {
    const cities = [
        { city: 'Jakarta', code: 'CGK', name: 'Soekarno-Hatta International Airport' },
        { city: 'Bali', code: 'DPS', name: 'Ngurah Rai International Airport' },
        { city: 'Surabaya', code: 'SUB', name: 'Juanda International Airport' },
        { city: 'Yogyakarta', code: 'JOG', name: 'Adisutjipto International Airport' },
        { city: 'Medan', code: 'KNO', name: 'Kualanamu International Airport' },
        { city: 'Makassar', code: 'UPG', name: 'Sultan Hasanuddin International Airport' },
        { city: 'Balikpapan', code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman Airport' },
        { city: 'Manado', code: 'MDC', name: 'Sam Ratulangi International Airport' },
        { city: 'Tokyo', code: 'NRT', name: 'Narita International Airport' },
        { city: 'Singapore', code: 'SIN', name: 'Changi Airport' },
        { city: 'Kuala Lumpur', code: 'KUL', name: 'Kuala Lumpur International Airport' },
        { city: 'Bangkok', code: 'BKK', name: 'Suvarnabhumi Airport' },
        { city: 'Dubai', code: 'DXB', name: 'Dubai International Airport' },
        { city: 'Paris', code: 'CDG', name: 'Charles de Gaulle Airport' },
        { city: 'New York', code: 'JFK', name: 'John F. Kennedy International Airport' },
        { city: 'London', code: 'LHR', name: 'Heathrow Airport' },
        { city: 'Sydney', code: 'SYD', name: 'Sydney Kingsford Smith Airport' },
    ];

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        if (value) {
            const found = cities.find(c => c.code === value || c.city.toLowerCase() === value.toLowerCase());
            if (found) setDisplayValue(`${found.city} (${found.code})`);
            else setDisplayValue(value);
        } else {
            setDisplayValue('');
        }
    }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query.trim() === ''
        ? cities
        : cities.filter(c =>
            c.city.toLowerCase().includes(query.toLowerCase()) ||
            c.code.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = (c) => {
        onChange(c.city);
        setDisplayValue(`${c.city} (${c.code})`);
        setQuery('');
        setOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setDisplayValue('');
        setQuery('');
    };

    return (
        <div ref={ref} style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 15, color: '#888', zIndex: 1 }}>{icon}</span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={open ? query : displayValue}
                    onFocus={() => { setOpen(true); setQuery(''); }}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    style={{
                        width: '100%',
                        padding: '15px 42px 15px 45px',
                        border: '2px solid ' + (open ? tokens.colors.brand : '#e0e0e0'),
                        borderRadius: '12px',
                        fontSize: '15px',
                        outline: 'none',
                        background: '#fff',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        transition: 'border 0.2s',
                    }}
                />
                {displayValue && !open && (
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center' }}
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
                            zIndex: 100,
                            maxHeight: '220px',
                            overflowY: 'auto',
                        }}
                    >
                        {filtered.length === 0 ? (
                            <div style={{ padding: '14px 18px', color: '#aaa', fontSize: 14 }}>Tidak ditemukan</div>
                        ) : filtered.map((c, i) => (
                            <div
                                key={c.code}
                                onMouseDown={() => handleSelect(c)}
                                style={{
                                    padding: '11px 18px',
                                    cursor: 'pointer',
                                    borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f5f7f9'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ fontWeight: 700, fontSize: 14, color: tokens.colors.brand, minWidth: 38 }}>{c.code}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{c.city}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.name}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LandingPage = ({ onGetStarted }) => {
    const [searchForm, setSearchForm] = useState({
        from: '',
        to: '',
        departureDate: '',
        returnDate: '',
        passengers: 1
    });

    const handleSearch = (e) => {
        e.preventDefault();
        onGetStarted();
    };

    const handleDestinationClick = (destination) => {
        // Set the destination and navigate to login/booking
        onGetStarted();
    };

    return (
        <div style={styles.page}>
            <Navbar
                user={null}
                onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onLogout={() => { }}
                onProfile={onGetStarted}
                onHistory={onGetStarted}
                onLogin={onGetStarted}
            />

            {/* Hero Section */}
            <section style={{
                background: tokens.colors.hero,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '-76px', // Offset sticky navbar height
                paddingTop: '76px'
            }}>
                {/* Background accents */}
                <div aria-hidden style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.9,
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: 520,
                        height: 520,
                        left: -140,
                        top: -180,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.18)',
                        filter: 'blur(2px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        width: 620,
                        height: 620,
                        right: -220,
                        bottom: -260,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.14)',
                        filter: 'blur(2px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.20), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 50%)'
                    }} />
                </div>

                <div style={{
                    ...styles.container,
                    textAlign: 'center',
                    zIndex: 2,
                    paddingTop: 74
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{ marginBottom: 18 }}>
                            <span style={styles.pill}>
                                <Star size={16} fill="#ffd166" color="#ffd166" />
                                Booking cepat, harga bersaing, support 24/7
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: '3.55rem',
                            fontWeight: '900',
                            color: '#fff',
                            marginBottom: '20px',
                            lineHeight: '1.1',
                            letterSpacing: '-0.03em'
                        }}>
                            Temukan Penerbangan <span style={{ color: '#ffd166' }}>Impian Anda</span>
                        </h1>
                        <p style={{
                            fontSize: '1.2rem',
                            color: 'rgba(255,255,255,0.9)',
                            marginBottom: '40px',
                            lineHeight: '1.6'
                        }}>
                            Pesan tiket pesawat dengan mudah dan hemat. Jelajahi destinasi menakjubkan dengan harga terbaik.
                        </p>
                    </motion.div>

                    {/* Search Form */}
                    <motion.div
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: tokens.radius.lg,
                            padding: '30px',
                            boxShadow: tokens.shadow.lg,
                            border: '1px solid rgba(255,255,255,0.55)',
                            maxWidth: '900px',
                            margin: '0 auto'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <form onSubmit={handleSearch} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px',
                                alignItems: 'center'
                            }}>
                                <CityCombobox
                                    value={searchForm.from}
                                    onChange={(val) => setSearchForm({ ...searchForm, from: val })}
                                    placeholder="Dari kota/bandara mana?"
                                    icon={<MapPin size={18} />}
                                />
                                <CityCombobox
                                    value={searchForm.to}
                                    onChange={(val) => setSearchForm({ ...searchForm, to: val })}
                                    placeholder="Ke kota/bandara mana?"
                                    icon={<MapPin size={18} />}
                                />
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '15px'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Calendar size={18} style={{
                                        position: 'absolute',
                                        left: '15px',
                                        color: '#666',
                                        zIndex: 1
                                    }} />
                                    <input
                                        type="date"
                                        style={{
                                            width: '100%',
                                            padding: '15px 15px 15px 45px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            background: '#fff'
                                        }}
                                        value={searchForm.departureDate}
                                        onChange={(e) => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                                    />
                                </div>

                                <div style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Calendar size={18} style={{
                                        position: 'absolute',
                                        left: '15px',
                                        color: '#666',
                                        zIndex: 1
                                    }} />
                                    <input
                                        type="date"
                                        style={{
                                            width: '100%',
                                            padding: '15px 15px 15px 45px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            background: '#fff'
                                        }}
                                        value={searchForm.returnDate}
                                        onChange={(e) => setSearchForm({ ...searchForm, returnDate: e.target.value })}
                                    />
                                </div>
                                <div style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Users size={18} style={{
                                        position: 'absolute',
                                        left: '15px',
                                        color: '#666',
                                        zIndex: 1
                                    }} />
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '15px 15px 15px 45px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            background: '#fff'
                                        }}
                                        value={searchForm.passengers}
                                        onChange={(e) => setSearchForm({ ...searchForm, passengers: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>1 Penumpang</option>
                                        <option value={2}>2 Penumpang</option>
                                        <option value={3}>3 Penumpang</option>
                                        <option value={4}>4 Penumpang</option>
                                        <option value={5}>5 Penumpang</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={{
                                background: tokens.colors.brandGradient,
                                color: '#fff',
                                border: 'none',
                                borderRadius: tokens.radius.md,
                                padding: '18px 30px',
                                fontSize: '18px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.3s',
                                marginTop: '10px'
                            }}>
                                <Search size={20} />
                                Cari Penerbangan
                            </button>
                        </form>
                    </motion.div>

                    {/* Stats strip */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 14,
                        margin: '26px auto 0',
                        maxWidth: 980
                    }}>
                        {[{
                            value: '2.5K+',
                            label: 'Penerbangan / hari'
                        }, {
                            value: '120+',
                            label: 'Bandara terhubung'
                        }, {
                            value: '24/7',
                            label: 'Customer support'
                        }, {
                            value: '4.9/5',
                            label: 'Rating pengguna'
                        }].map((item) => (
                            <div key={item.label} style={{
                                background: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.22)',
                                borderRadius: tokens.radius.md,
                                padding: '14px 16px',
                                color: '#fff'
                            }}>
                                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>{item.value}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ ...styles.section, background: tokens.colors.bg }}>
                <div style={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.h2}>Mengapa Memilih Kami</h2>
                            <p style={styles.subtitle}>
                                Kami merancang pengalaman booking yang cepat, aman, dan nyaman — dari pencarian sampai pembayaran.
                            </p>
                        </div>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 18,
                    }}>
                        {[
                            {
                                icon: <Shield size={48} />,
                                title: 'Aman & Terpercaya',
                                description: 'Sistem pembayaran yang aman dan data pribadi terlindungi'
                            },
                            {
                                icon: <Clock size={48} />,
                                title: 'Cepat & Mudah',
                                description: 'Proses pemesanan tiket hanya dalam beberapa menit'
                            },
                            {
                                icon: <Headphones size={48} />,
                                title: 'Support 24/7',
                                description: 'Tim customer service siap membantu kapan saja'
                            },
                            {
                                icon: <CreditCard size={48} />,
                                title: 'Harga Terbaik',
                                description: 'Dapatkan harga tiket pesawat termurah di sini'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                style={{
                                    ...styles.card,
                                    padding: '26px 22px',
                                    textAlign: 'left',
                                    transition: 'transform 0.18s ease, box-shadow 0.18s ease'
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                                <div style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: 16,
                                    background: 'rgba(1,148,243,0.10)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: tokens.colors.brand,
                                    marginBottom: 16
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '700',
                                    color: tokens.colors.text,
                                    marginBottom: 10
                                }}>{feature.title}</h3>
                                <p style={{
                                    fontSize: '1rem',
                                    color: tokens.colors.muted,
                                    lineHeight: 1.7,
                                    margin: 0
                                }}>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destinations Section */}
            <section style={{ ...styles.section, background: tokens.colors.surface }}>
                <div style={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.h2}>Destinasi Populer</h2>
                            <p style={styles.subtitle}>Inspirasi perjalanan untuk rencana liburan berikutnya.</p>
                        </div>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 18,
                    }}>
                        {DESTINATIONS.map((destination, index) => (
                            <motion.div
                                key={index}
                                onClick={() => handleDestinationClick(destination)}
                                style={{
                                    background: tokens.colors.surface,
                                    borderRadius: tokens.radius.md,
                                    overflow: 'hidden',
                                    border: `1px solid ${tokens.colors.border}`,
                                    boxShadow: tokens.shadow.sm,
                                    cursor: 'pointer',
                                    transform: 'translateY(0px)',
                                    position: 'relative',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                                whileHover={{ y: -6, boxShadow: tokens.shadow.md }}
                            >
                                <div style={{
                                    position: 'relative',
                                    height: '200px',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transform: 'scale(1.02)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                    <div aria-hidden style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(15,23,42,0.65), transparent 52%)'
                                    }} />
                                    {/* Price badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(255,255,255,0.92)',
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: tokens.colors.brand,
                                        border: '1px solid rgba(255,255,255,0.55)',
                                        backdropFilter: 'blur(6px)'
                                    }}>
                                        {destination.price}
                                    </div>
                                    {/* Airport code badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        background: 'rgba(1,148,243,0.85)',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        color: '#fff',
                                        letterSpacing: '0.05em',
                                        backdropFilter: 'blur(6px)'
                                    }}>
                                        {destination.airportCode}
                                    </div>
                                    {/* Destination name overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '14px',
                                        left: '16px',
                                        right: '16px',
                                    }}>
                                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{destination.name}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', marginTop: 2 }}>{destination.country}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '16px 20px 18px' }}>
                                    <p style={{ fontSize: '13px', color: tokens.colors.muted, margin: '0 0 12px', lineHeight: 1.5 }}>
                                        {destination.airportName}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDestinationClick(destination); }}
                                        style={{
                                            width: '100%',
                                            background: tokens.colors.brandGradient,
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '11px 16px',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            transition: 'opacity 0.18s ease',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        <Search size={15} />
                                        Cari Tiket ke {destination.name}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section style={{ ...styles.section, background: tokens.colors.bg }}>
                <div style={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.h2}>Apa Kata Pelanggan</h2>
                            <p style={styles.subtitle}>Ribuan pengguna mempercayakan perjalanan mereka pada kami.</p>
                        </div>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 18,
                    }}>
                        {[
                            {
                                name: "Andi Pratama",
                                role: "Business Traveler",
                                content: "Pelayanan sangat memuaskan! Proses booking cepat dan harga kompetitif.",
                                rating: 5
                            },
                            {
                                name: "Sarah Wijaya",
                                role: "Tourist",
                                content: "Aplikasi user-friendly, banyak pilihan penerbangan dengan harga terbaik.",
                                rating: 5
                            },
                            {
                                name: "Budi Santoso",
                                role: "Family Traveler",
                                content: "Sudah beberapa kali menggunakan layanan ini, selalu puas dengan pelayanannya.",
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                style={{
                                    ...styles.card,
                                    padding: '26px 22px',
                                    textAlign: 'left'
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                                whileHover={{ transform: 'translateY(-4px)', boxShadow: tokens.shadow.md }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    marginBottom: 14
                                }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} fill="#ffd166" color="#ffd166" />
                                        ))}
                                    </div>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 750,
                                        color: tokens.colors.brand,
                                        background: 'rgba(1,148,243,0.10)',
                                        border: '1px solid rgba(1,148,243,0.16)',
                                        padding: '6px 10px',
                                        borderRadius: tokens.radius.pill
                                    }}>
                                        Verified
                                    </span>
                                </div>
                                <p style={{
                                    fontSize: '1rem',
                                    color: tokens.colors.muted,
                                    lineHeight: 1.7,
                                    marginBottom: 18
                                }}>
                                    "{testimonial.content}"
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: tokens.colors.brandGradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '18px'
                                    }}>
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: tokens.colors.text
                                        }}>
                                            {testimonial.name}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: tokens.colors.muted
                                        }}>
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: tokens.colors.brandGradient,
                padding: '92px 0',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.95 }}>
                    <div style={{
                        position: 'absolute',
                        width: 560,
                        height: 560,
                        borderRadius: '50%',
                        left: -200,
                        bottom: -260,
                        background: 'rgba(255,255,255,0.16)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        width: 520,
                        height: 520,
                        borderRadius: '50%',
                        right: -220,
                        top: -240,
                        background: 'rgba(0,0,0,0.12)'
                    }} />
                </div>

                <div style={{ ...styles.container, maxWidth: '900px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            color: '#fff',
                            marginBottom: '20px'
                        }}>
                            Siap Terbang?
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            color: 'rgba(255,255,255,0.9)',
                            marginBottom: '30px'
                        }}>
                            Bergabunglah dengan ribuan pelanggan yang puas dengan layanan kami
                        </p>
                        <button onClick={onGetStarted} style={{
                            background: '#fff',
                            color: tokens.colors.brand,
                            border: 'none',
                            borderRadius: tokens.radius.md,
                            padding: '18px 40px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                            boxShadow: tokens.shadow.md
                        }}>
                            Mulai Sekarang
                            <ChevronRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
