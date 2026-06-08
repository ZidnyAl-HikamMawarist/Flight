import 'package:flutter/material.dart';

import '../api_service.dart';

class SeatSelectionScreen extends StatefulWidget {
  final Map<String, dynamic> flight;

  const SeatSelectionScreen({required this.flight});

  @override
  State<SeatSelectionScreen> createState() => _SeatSelectionScreenState();
}

class _SeatSelectionScreenState extends State<SeatSelectionScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();

  List<dynamic> _seats = [];
  bool _isLoading = true;
  bool _isSubmitting = false;

  Map<String, dynamic>? _selectedSeat;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        ApiService.getSeats(widget.flight['flightCall']?.toString() ?? ''),
        ApiService.getMe(),
      ]);

      final seats = results[0] as List<dynamic>;
      final me = results[1] as Map<String, dynamic>;
      final fullName = me['fullName']?.toString().trim() ?? '';
      final nameParts = fullName.split(' ').where((part) => part.isNotEmpty).toList();

      if (!mounted) return;
      setState(() {
        _seats = seats;
        _isLoading = false;
      });

      _firstNameController.text = nameParts.isNotEmpty ? nameParts.first : '';
      _lastNameController.text =
          nameParts.length > 1 ? nameParts.skip(1).join(' ') : '';
      _emailController.text = me['email']?.toString() ?? '';
      _phoneController.text = me['phone']?.toString() ?? '';
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _showMessage('Gagal memuat kursi dari server.');
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: const Color(0xFF1E293B),
      ),
    );
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

  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    return emailRegex.hasMatch(email);
  }

  bool _isValidPhone(String phone) {
    final phoneRegex = RegExp(r'^(\+62|0)[0-9]{9,12}$');
    return phoneRegex.hasMatch(phone.replaceAll(' ', '').replaceAll('-', ''));
  }

  Future<void> _confirmBooking() async {
    if (_selectedSeat == null) {
      _showMessage('❌ Pilih kursi terlebih dahulu.');
      return;
    }

    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();

    if (firstName.isEmpty) {
      _showMessage('❌ Nama depan wajib diisi.');
      return;
    }

    if (lastName.isEmpty) {
      _showMessage('❌ Nama belakang wajib diisi.');
      return;
    }

    if (email.isEmpty) {
      _showMessage('❌ Email wajib diisi.');
      return;
    }

    if (!_isValidEmail(email)) {
      _showMessage('❌ Format email tidak valid (contoh: user@example.com)');
      return;
    }

    if (phone.isEmpty) {
      _showMessage('❌ Nomor telepon wajib diisi.');
      return;
    }

    if (!_isValidPhone(phone)) {
      _showMessage('❌ Format telepon harus 08xx atau +62xx (minimal 10 digit)');
      return;
    }

    setState(() => _isSubmitting = true);

    final result = await ApiService.createBooking({
      'flightCall': widget.flight['flightCall'],
      'aircraftId': _selectedSeat!['aircraftId'],
      'seatId': _selectedSeat!['seatId'],
      'passenger': {
        'firstName': _firstNameController.text.trim(),
        'lastName': _lastNameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
      },
    });

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (result['success'] == true) {
      showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Icon(Icons.check_circle, color: Colors.green, size: 60),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Pemesanan Berhasil! ✈️',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Kursi ${_selectedSeat!['seatId']} telah berhasil dipesan.\nData sinkron dengan website.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),
            ],
          ),
          actions: [
            Center(
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E40AF),
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                ),
                child: const Text('SELESAI'),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      );
      return;
    }

    String errorMsg = result['message']?.toString() ?? 'Terjadi kesalahan saat membuat booking';
    if (errorMsg.contains('already exists')) {
      errorMsg = '❌ Kursi ini sudah terpesan. Pilih kursi lain.';
    } else if (errorMsg.contains('not found') || errorMsg.contains('invalid')) {
      errorMsg = '❌ Data tidak valid. Periksa kembali semua field.';
    } else if (errorMsg.contains('constraint') || errorMsg.contains('Violation')) {
      errorMsg = '❌ Kursi sudah terpesan orang lain. Refresh dan pilih kursi lain.';
    } else if (!errorMsg.startsWith('❌')) {
      errorMsg = '❌ $errorMsg';
    }
    _showMessage(errorMsg);
  }

  Map<int, List<Map<String, dynamic>>> _groupSeatsByRow() {
    final rows = <int, List<Map<String, dynamic>>>{};

    for (final rawSeat in _seats) {
      final seat = Map<String, dynamic>.from(rawSeat as Map);
      final seatId = seat['seatId']?.toString() ?? '';
      final match = RegExp(r'^(\d+)').firstMatch(seatId);
      final rowNumber = int.tryParse(match?.group(1) ?? '');

      if (rowNumber == null) continue;
      rows.putIfAbsent(rowNumber, () => []);
      rows[rowNumber]!.add(seat);
    }

    for (final entry in rows.entries) {
      entry.value.sort(
        (a, b) => (a['seatId']?.toString() ?? '')
            .compareTo(b['seatId']?.toString() ?? ''),
      );
    }

    return rows;
  }

  @override
  Widget build(BuildContext context) {
    final groupedSeats = _groupSeatsByRow();
    final sortedRows = groupedSeats.keys.toList()..sort();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Pilih Kursi'),
        backgroundColor: const Color(0xFF1BA0E2),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildHeader(),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      _buildLegend(),
                      const SizedBox(height: 32),
                      _buildAircraftLayout(sortedRows, groupedSeats),
                      const SizedBox(height: 40),
                      _buildPassengerForm(),
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ],
            ),
      bottomSheet: _buildBottomAction(),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1BA0E2), Color(0xFF0D6EAA)],
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${widget.flight['origin']} → ${widget.flight['destination']}',
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
              ),
              Text(
                widget.flight['flightCall']?.toString() ?? '-',
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
            child: Text(
              _selectedSeat != null ? 'Kursi: ${_selectedSeat!['seatId']}' : 'Pilih Kursi',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildLegendItem(const Color(0xFF1BA0E2).withOpacity(0.1), 'Tersedia'),
        const SizedBox(width: 20),
        _buildLegendItem(const Color(0xFF1BA0E2), 'Terpilih'),
        const SizedBox(width: 20),
        _buildLegendItem(Colors.grey.shade200, 'Terisi'),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildAircraftLayout(List<int> sortedRows, Map<int, List<Map<String, dynamic>>> groupedSeats) {
    return Column(
      children: [
        Container(
          width: 100,
          height: 30,
          decoration: BoxDecoration(color: Colors.blueGrey.shade50, borderRadius: const BorderRadius.vertical(top: Radius.circular(50))),
          child: Center(child: Text('COCKPIT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.blueGrey.shade300, letterSpacing: 2))),
        ),
        const SizedBox(height: 20),
        ...sortedRows.map((row) {
          final seats = groupedSeats[row] ?? [];
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(width: 20, child: Text(row.toString(), style: TextStyle(color: Colors.blueGrey.shade200, fontWeight: FontWeight.w900, fontSize: 12))),
                const SizedBox(width: 12),
                Wrap(
                  spacing: 10,
                  children: seats.map((seat) => _buildSeatWidget(seat)).toList(),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildSeatWidget(Map<String, dynamic> seat) {
    final seatId = seat['seatId']?.toString() ?? '';
    final isAvailable = seat['isAvailable'] == true;
    final isSelected = _selectedSeat?['seatId'] == seatId;
    final isBusiness = seat['className'] == 'Business';

    return GestureDetector(
      onTap: !isAvailable ? null : () => setState(() => _selectedSeat = seat),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 44,
        height: 48,
        decoration: BoxDecoration(
          color: !isAvailable
              ? Colors.grey.shade100
              : isSelected
                  ? const Color(0xFF1BA0E2)
                  : isBusiness ? const Color(0xFF7C3AED).withOpacity(0.1) : const Color(0xFF1BA0E2).withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF0D6EAA) : isAvailable ? (isBusiness ? const Color(0xFF7C3AED).withOpacity(0.2) : const Color(0xFF1BA0E2).withOpacity(0.1)) : Colors.grey.shade200,
            width: 1.5,
          ),
        ),
        child: Center(
          child: Text(
            seatId,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: isSelected ? Colors.white : isAvailable ? (isBusiness ? const Color(0xFF7C3AED) : const Color(0xFF1BA0E2)) : Colors.grey.shade300,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPassengerForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Data Penumpang', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
        const SizedBox(height: 20),
        _buildTextField(_firstNameController, 'Nama Depan', Icons.person_outline),
        const SizedBox(height: 16),
        _buildTextField(_lastNameController, 'Nama Belakang', Icons.badge_outlined),
        const SizedBox(height: 16),
        _buildTextField(_emailController, 'Email', Icons.alternate_email, keyboard: TextInputType.emailAddress),
        const SizedBox(height: 16),
        _buildTextField(_phoneController, 'Nomor Telepon', Icons.phone_android, keyboard: TextInputType.phone),
      ],
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {TextInputType? keyboard}) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: const Color(0xFF1BA0E2)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1BA0E2), width: 2),
        ),
      ),
    );
  }

  Widget _buildBottomAction() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, -5))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('TOTAL HARGA', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1)),
                Text(_formatCurrency(_selectedSeat?['price'] ?? widget.flight['price']), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFFF96D01))),
              ],
            ),
          ),
          SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _confirmBooking,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1BA0E2),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 32),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSubmitting 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('PESAN SEKARANG', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}
