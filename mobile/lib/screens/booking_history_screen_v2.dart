import 'package:flutter/material.dart';

import '../api_service.dart';

class BookingHistoryScreen extends StatefulWidget {
  @override
  State<BookingHistoryScreen> createState() => _BookingHistoryScreenState();
}

class _BookingHistoryScreenState extends State<BookingHistoryScreen> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final history = await ApiService.getBookingHistory();
      if (!mounted) return;
      setState(() {
        _bookings = history;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  String _formatCurrency(dynamic value) {
    final amount = value is num ? value : num.tryParse(value?.toString() ?? '');
    if (amount == null || amount == 0) return 'Harga belum tersedia';

    final text = amount.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'\B(?=(\d{3})+(?!\d))'),
          (match) => '.',
        );
    return 'Rp $text';
  }

  String _formatDate(String? value) {
    final date = value == null ? null : DateTime.tryParse(value);
    if (date == null) return '-';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Riwayat Booking'),
        backgroundColor: const Color(0xFF1BA0E2),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _bookings.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadHistory,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _bookings.length,
                    itemBuilder: (context, index) => _buildBookingCard(_bookings[index]),
                  ),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history_toggle_off, size: 80, color: Colors.blueGrey.shade100),
          const SizedBox(height: 16),
          const Text('Belum ada riwayat booking', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const Text('Ayo mulai cari penerbangan!', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _formatDate(booking['departureTime']),
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                  child: const Text('BERHASIL', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildAirportInfo(booking['origin'], booking['originCity'])),
                const Icon(Icons.arrow_forward, color: Color(0xFF1BA0E2), size: 16),
                Expanded(child: _buildAirportInfo(booking['destination'], booking['destinationCity'], alignEnd: true)),
              ],
            ),
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('KURSI', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.w800)),
                    Text(booking['seatId']?.toString() ?? '-', style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('TOTAL PEMBAYARAN', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.w800)),
                    Text(_formatCurrency(booking['paymentAmount']), style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAirportInfo(String? code, String? city, {bool alignEnd = false}) {
    return Column(
      crossAxisAlignment: alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(code ?? '-', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
        Text(city ?? '-', style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
