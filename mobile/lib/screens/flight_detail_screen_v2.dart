import 'package:flutter/material.dart';
import 'seat_selection_screen_v2.dart';

class FlightDetailScreen extends StatelessWidget {
  final Map<String, dynamic> flight;

  const FlightDetailScreen({required this.flight});

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
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _formatTime(String? value) {
    final date = value == null ? null : DateTime.tryParse(value);
    if (date == null) return '-';
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final statusName = flight['statusName']?.toString() ?? 'Scheduled';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Detail Penerbangan'),
        backgroundColor: const Color(0xFF1BA0E2),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1BA0E2), Color(0xFF0D6EAA)],
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(32),
                  bottomRight: Radius.circular(32),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildAirportHeader(
                        code: flight['origin']?.toString() ?? '-',
                        city: flight['originCity']?.toString() ?? '-',
                        alignEnd: false,
                      ),
                      const Column(
                        children: [
                          Icon(Icons.flight_takeoff, color: Colors.white54, size: 28),
                          SizedBox(height: 8),
                          Text(
                            'Non-stop',
                            style: TextStyle(color: Colors.white54, fontSize: 12),
                          ),
                        ],
                      ),
                      _buildAirportHeader(
                        code: flight['destination']?.toString() ?? '-',
                        city: flight['destinationCity']?.toString() ?? '-',
                        alignEnd: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildHeroMeta(Icons.calendar_today, 'TANGGAL', _formatDate(flight['departureTime']?.toString())),
                        _buildHeroMeta(Icons.access_time, 'WAKTU', _formatTime(flight['departureTime']?.toString())),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Informasi Penerbangan',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailItem(Icons.airplane_ticket_rounded, 'Nomor Penerbangan', flight['flightCall']?.toString() ?? '-'),
                  _buildDetailItem(Icons.airplanemode_active, 'Pesawat', flight['aircraftModel']?.toString() ?? 'Aircraft'),
                  _buildDetailItem(Icons.timer_outlined, 'Durasi', flight['duration']?.toString() ?? '-'),
                  _buildDetailItem(Icons.info_outline, 'Status', statusName),
                  const SizedBox(height: 32),
                  const Divider(height: 1),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Harga Mulai Dari',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatCurrency(flight['price']),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFF96D01),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => SeatSelectionScreen(flight: flight),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1BA0E2),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 28),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('PILIH KURSI', style: TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAirportHeader({required String code, required String city, required bool alignEnd}) {
    return Column(
      crossAxisAlignment: alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          code,
          style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800, letterSpacing: -0.5),
        ),
        Text(
          city,
          style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w500, fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildHeroMeta(IconData icon, String label, String value) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, color: Colors.white70, size: 14),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1)),
          ],
        ),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
      ],
    );
  }

  Widget _buildDetailItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: const Color(0xFF1BA0E2), size: 20),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(color: Colors.grey.shade400, fontSize: 12, fontWeight: FontWeight.w600)),
              Text(value, style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.w700, fontSize: 15)),
            ],
          ),
        ],
      ),
    );
  }
}
