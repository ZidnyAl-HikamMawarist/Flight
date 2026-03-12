import React, { useState, useEffect, useRef } from 'react';
import { Plane, User, Ticket, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme';

const Navbar = ({ user, onLogout, onProfile, onHistory, onGoHome, onLogin }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { label: 'Profil Saya', icon: <User size={18} />, onClick: onProfile },
        { label: 'Riwayat Pesanan', icon: <Ticket size={18} />, onClick: onHistory },
        { label: 'Logout', icon: <LogOut size={18} />, onClick: onLogout, danger: true },
    ];

    return (
        <nav style={styles.nav}>
            <div style={styles.navInner}>
                {/* Left: Logo */}
                <div style={styles.logo} onClick={onGoHome}>
                    <div style={styles.logoIcon}>
                        <Plane size={24} color="#fff" strokeWidth={3} />
                    </div>
                    <span style={styles.logoText}>FlightBooking</span>
                </div>

                {/* Center: Greeting */}
                {user && (
                    <div style={styles.centerGreeting}>
                        Halo, <span style={styles.userName}>{user.fullName?.split(' ')[0] || 'User'}</span>
                    </div>
                )}

                {/* Right: Burger Menu */}
                <div style={styles.navRight} ref={menuRef}>
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                style={{
                                    ...styles.burgerBtn,
                                    background: isMenuOpen ? theme.colors.background : 'transparent',
                                    borderColor: isMenuOpen ? theme.colors.primary : theme.colors.border
                                }}
                            >
                                {isMenuOpen ? <X size={22} color={theme.colors.primary} /> : <Menu size={22} color={theme.colors.text} />}
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        style={styles.dropdown}
                                    >
                                        <div style={styles.dropdownHeader}>
                                            <div style={styles.avatar}>{user.fullName?.[0] || 'U'}</div>
                                            <div style={styles.userInfo}>
                                                <div style={styles.userNameFull}>{user.fullName || 'User'}</div>
                                                <div style={styles.userEmail}>{user.email || ''}</div>
                                            </div>
                                        </div>
                                        <div style={styles.divider} />
                                        {menuItems.map((item, idx) => (
                                            <button
                                                key={idx}
                                                style={{
                                                    ...styles.dropdownItem,
                                                    color: item.danger ? theme.colors.accent : theme.colors.text,
                                                }}
                                                onClick={() => {
                                                    item.onClick();
                                                    setIsMenuOpen(false);
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.background}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{
                                                    ...styles.itemIcon,
                                                    color: item.danger ? theme.colors.accent : theme.colors.primary
                                                }}>
                                                    {item.icon}
                                                </div>
                                                {item.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button onClick={onLogin || onGoHome} style={styles.loginBtn}>Masuk</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 1001,
        height: '76px',
        display: 'flex',
        alignItems: 'center'
    },
    navInner: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: theme.colors.primaryGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 12px ${theme.colors.primary}40`
    },
    logoText: {
        fontSize: '22px',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        color: theme.colors.primary,
        fontFamily: theme.fonts.primary
    },
    centerGreeting: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '16px',
        color: theme.colors.textMuted,
        fontWeight: 600,
        letterSpacing: '-0.01em'
    },
    userName: {
        fontWeight: 800,
        color: theme.colors.text
    },
    navRight: {
        display: 'flex',
        alignItems: 'center'
    },
    burgerBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1.5px solid transparent',
        padding: 0,
    },
    loginBtn: {
        background: theme.colors.primaryGradient,
        color: '#fff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: `0 4px 15px ${theme.colors.primary}30`,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' }
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 14px)',
        right: 0,
        width: '260px',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
        padding: '10px',
        zIndex: 1002
    },
    dropdownHeader: {
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: `${theme.colors.primary}15`,
        color: theme.colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '18px'
    },
    userInfo: {
        overflow: 'hidden'
    },
    userNameFull: {
        fontWeight: 800,
        fontSize: '15px',
        color: theme.colors.text,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    userEmail: {
        fontSize: '12px',
        color: theme.colors.textMuted,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    divider: {
        height: '1px',
        background: theme.colors.border,
        margin: '8px 4px'
    },
    dropdownItem: {
        width: '100%',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'transparent',
        border: 'none',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: '12px',
        transition: 'all 0.2s',
    },
    itemIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px'
    }
};

export default Navbar;
