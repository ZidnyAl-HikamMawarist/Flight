import React from 'react'
import { X, Ticket, User, MapPin, Clock } from 'lucide-react'
import { theme, ui } from '../../theme'

const BookingDetail = ({ booking, onClose }) => {
  if (!booking) return null

  const flight = booking.flight || {}
  const schedule = flight.schedule || {}
  const origin = schedule.originAirport || {}
  const dest = schedule.destinationAirport || {}
  const client = booking.client || {}

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const handleCancel = async () => {
    if (!confirm('Batalkan booking ini?')) return
    try {
      await fetch(`http://localhost:3333/api/bookings/${booking.bookingId}`, { method: 'DELETE' })
      // inform parent via onClose then refresh
      if (typeof booking._onDeleted === 'function') booking._onDeleted()
      onClose()
    } catch (err) {
      console.error('Gagal batalkan booking', err)
      alert('Gagal batalkan booking')
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>

        <div style={styles.header}>
          <Ticket size={28} color="#0194f3" />
          <div>
            <h3 style={styles.title}>Detail Booking</h3>
            <div style={styles.sub}>#{booking.bookingId} • {flight.flightCall}</div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.row}><strong>Penumpang</strong></div>
          <div style={styles.row}><User size={14} /> {client.firstName} {client.lastName}</div>
          <div style={styles.row}><small>{client.email} • {client.phone}</small></div>
        </div>

        <div style={styles.section}>
          <div style={styles.row}><strong>Rute & Waktu</strong></div>
          <div style={styles.row}>{origin.iataAirportCode} → {dest.iataAirportCode}</div>
          <div style={styles.row}><Clock size={14} /> {formatDate(schedule.departureTimeGmt)} • {formatTime(schedule.departureTimeGmt)}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.row}><strong>Detail Kursi</strong></div>
          <div style={styles.row}><MapPin size={14} /> Kursi: <strong>{booking.seatId}</strong></div>
          <div style={styles.row}><small>Dipesan pada: {formatDate(booking.createdAt)}</small></div>
        </div>

        <div style={styles.actions}>
          <button style={{ ...styles.primary, background: '#e53935' }} onClick={handleCancel}>Batalkan Booking</button>
          <div style={{ width: 8 }} />
          <button style={styles.primary} onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 },
  modal: { width: '90%', maxWidth: '560px', background: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, position: 'relative', boxShadow: theme.shadows['2xl'], border: `1px solid ${theme.colors.border}`, fontFamily: theme.fonts.primary },
  closeBtn: { position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: theme.colors.textMuted },
  header: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 },
  title: { margin: 0, fontSize: 18, fontWeight: 800 },
  sub: { fontSize: 13, color: theme.colors.textMuted },
  section: { marginTop: 12, paddingTop: 8, borderTop: `1px solid ${theme.colors.border}` },
  row: { marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', color: theme.colors.text },
  actions: { marginTop: 18, display: 'flex', justifyContent: 'flex-end' },
  primary: { ...ui.button.primary, padding: '10px 16px' }
}

export default BookingDetail
