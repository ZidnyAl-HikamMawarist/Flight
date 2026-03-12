import React from 'react';
import { Plane, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.grid}>
                    {/* Brand Section */}
                    <div style={styles.brandSection}>
                        <div style={styles.logo}>
                            <div style={styles.logoIcon}>
                                <Plane size={20} color="#7dd3fc" />
                            </div>
                            <span style={styles.logoText}>FlightBooking</span>
                        </div>
                        <p style={styles.brandDesc}>
                            Platform pemesanan tiket pesawat terpercaya dengan harga terbaik dan pelayanan prima di seluruh dunia.
                        </p>
                        <div style={styles.socials}>
                            <Facebook size={20} style={styles.socialIcon} />
                            <Twitter size={20} style={styles.socialIcon} />
                            <Instagram size={20} style={styles.socialIcon} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={styles.linkSection}>
                        <h4 style={styles.sectionTitle}>Quick Links</h4>
                        <ul style={styles.linkList}>
                            <li><a href="#" style={styles.link}>Tentang Kami</a></li>
                            <li><a href="#" style={styles.link}>Cara Pemesanan</a></li>
                            <li><a href="#" style={styles.link}>Syarat & Ketentuan</a></li>
                            <li><a href="#" style={styles.link}>Kebijakan Privasi</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div style={styles.linkSection}>
                        <h4 style={styles.sectionTitle}>Hubungi Kami</h4>
                        <div style={styles.contactList}>
                            <div style={styles.contactItem}>
                                <Mail size={18} style={styles.contactIcon} />
                                <span>info@flightbooking.com</span>
                            </div>
                            <div style={styles.contactItem}>
                                <Phone size={18} style={styles.contactIcon} />
                                <span>+62 21 1234 5678</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <p style={styles.copyright}>
                        © 2024 FlightBooking. All rights reserved. Made with ❤️ for travelers.
                    </p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        background: '#0b1220',
        color: '#fff',
        padding: '80px 0 30px',
        marginTop: 'auto', // Important for sticky footer effect
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '60px'
    },
    brandSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoText: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#e2e8f0',
        letterSpacing: '-0.02em'
    },
    brandDesc: {
        fontSize: '0.95rem',
        lineHeight: '1.6',
        color: 'rgba(226,232,240,0.7)',
        maxWidth: '300px'
    },
    socials: {
        display: 'flex',
        gap: '16px',
        marginTop: '10px'
    },
    socialIcon: {
        color: 'rgba(226,232,240,0.7)',
        cursor: 'pointer',
        transition: 'color 0.2s'
    },
    linkSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#fff',
        letterSpacing: '0.01em'
    },
    linkList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    link: {
        color: 'rgba(226,232,240,0.6)',
        textDecoration: 'none',
        fontSize: '0.95rem',
        transition: 'color 0.2s',
        '&:hover': { color: '#fff' }
    },
    contactList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'rgba(226,232,240,0.6)',
        fontSize: '0.95rem'
    },
    contactIcon: {
        color: '#0194f3'
    },
    bottomBar: {
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '30px',
        textAlign: 'center'
    },
    copyright: {
        fontSize: '0.9rem',
        color: 'rgba(226,232,240,0.5)',
        margin: 0
    }
};

export default Footer;
