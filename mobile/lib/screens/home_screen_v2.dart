import 'package:flutter/material.dart';

import '../api_service.dart';
import 'booking_history_screen_v2.dart';
import 'flight_detail_screen_v2.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _flights = [];
  List<dynamic> _airports = [];
  List<dynamic> _destinationOptions = [];

  bool _isLoading = true;

  String? _selectedOrigin;
  String? _selectedDestination;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    try {
      final results = await Future.wait([
        ApiService.getFlights(),
        ApiService.getAirports(),
        ApiService.getMe(),
      ]);

      if (!mounted) return;
      setState(() {
        _flights = results[0] as List<dynamic>;
        _airports = results[1] as List<dynamic>;
        _destinationOptions = results[1] as List<dynamic>;
        _user = results[2] as Map<String, dynamic>;
        _isLoading = false;
      });
      
      // Debug: Print flight data to check prices
      if (_flights.isNotEmpty) {
        print('Sample flight data: ${_flights[0]}');
        print('Sample flight price: ${_flights[0]['price']}');
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _showMessage('Gagal memuat data dari server. Error: $error');
    }
  }

  Future<void> _onOriginChanged(String? value) async {
    setState(() {
      _selectedOrigin = value;
      _selectedDestination = null;
    });

    final destinations = await ApiService.getAirports(from: value);
    if (!mounted) return;

    setState(() {
      _destinationOptions = destinations.isEmpty ? _airports : destinations;
    });
  }

  Future<void> _searchFlights() async {
    FocusScope.of(context).unfocus();
    setState(() => _isLoading = true);

    final flights = await ApiService.getFlights(
      origin: _selectedOrigin,
      destination: _selectedDestination,
    );

    if (!mounted) return;
    setState(() {
      _flights = flights;
      _isLoading = false;
    });
  }

  Future<void> _resetFilters() async {
    setState(() {
      _selectedOrigin = null;
      _selectedDestination = null;
      _destinationOptions = _airports;
    });
    await _searchFlights();
  }

  Future<void> _logout() async {
    await ApiService.removeToken();
    
    if (!mounted) return;
    
    setState(() {
      _flights = [];
      _airports = [];
      _destinationOptions = [];
      _user = null;
      _selectedOrigin = null;
      _selectedDestination = null;
    });
    
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => LoginScreen()),
    );
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

  String _formatDate(String? value) {
    final date = value == null ? null : DateTime.tryParse(value);
    if (date == null) return '-';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _formatTime(String? value) {
    final date = value == null ? null : DateTime.tryParse(value);
    if (date == null) return '-';
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'Arrived': return const Color(0xFF10B981);
      case 'Delayed': return const Color(0xFFF59E0B);
      case 'Cancelled': return const Color(0xFFEF4444);
      default: return const Color(0xFF3B82F6);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userName = _user?['fullName']?.toString().trim();
    final firstName = (userName == null || userName.isEmpty)
        ? 'Traveler'
        : userName.split(' ').first;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Flight Pro', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: const Color(0xFF1BA0E2),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded),
          ),
          const SizedBox(width: 8),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF1BA0E2)),
              accountName: Text(_user?['fullName']?.toString() ?? 'Traveler'),
              accountEmail: Text(_user?['email']?.toString() ?? '-'),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.white24,
                child: Icon(Icons.person, color: Colors.white, size: 40),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Riwayat Pemesanan'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => BookingHistoryScreen()),
                );
              },
            ),
            const Spacer(),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Keluar', style: TextStyle(color: Colors.red)),
              onTap: _logout,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadInitialData,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Stack(
                children: [
                  Container(
                    height: 180,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF1BA0E2), Color(0xFF0D6EAA)],
                      ),
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(32),
                        bottomRight: Radius.circular(32),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Halo, $firstName 👋',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Mau terbang ke mana hari ini?',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 28),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 30,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                _buildAirportSelector(
                                  label: 'DARI',
                                  value: _selectedOrigin,
                                  items: _airports,
                                  onChanged: _onOriginChanged,
                                  icon: Icons.flight_takeoff,
                                ),
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 12),
                                  child: Divider(height: 1),
                                ),
                                _buildAirportSelector(
                                  label: 'KE',
                                  value: _selectedDestination,
                                  items: _destinationOptions,
                                  onChanged: (val) => setState(() => _selectedDestination = val),
                                  icon: Icons.flight_land,
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  height: 52,
                                  child: ElevatedButton(
                                    onPressed: _isLoading ? null : _searchFlights,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFF96D01),
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    child: const Text('CARI TIKET', style: TextStyle(fontWeight: FontWeight.w700)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SliverPadding(
              padding: EdgeInsets.fromLTRB(20, 32, 20, 12),
              sliver: SliverToBoxAdapter(
                child: Text(
                  'Penerbangan Tersedia',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ),
            ),
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_flights.isEmpty)
              SliverToBoxAdapter(child: _buildEmptyState())
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildFlightCard(_flights[index]),
                    childCount: _flights.length,
                  ),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 40)),
          ],
        ),
      ),
    );
  }

  Widget _buildAirportSelector({
    required String label,
    required String? value,
    required List<dynamic> items,
    required ValueChanged<String?> onChanged,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF1BA0E2).withOpacity(0.7),
            letterSpacing: 1.2,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              hint: Text('Pilih Bandara', style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
              icon: Icon(Icons.keyboard_arrow_down, color: Colors.grey.shade400),
              dropdownColor: Colors.white,
              items: items.map((airport) {
                return DropdownMenuItem<String>(
                  value: airport['code']?.toString(),
                  child: Row(
                    children: [
                      Icon(icon, size: 18, color: const Color(0xFF1BA0E2)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          airport['label']?.toString() ?? '-',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFlightCard(dynamic flight) {
    final statusName = flight['statusName']?.toString() ?? 'Scheduled';
    final statusColor = _statusColor(statusName);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => FlightDetailScreen(flight: flight),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        statusName.toUpperCase(),
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                          fontSize: 10,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    Text(
                      flight['flightCall']?.toString() ?? '-',
                      style: TextStyle(
                        color: Colors.grey.shade400,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildAirportInfo(
                        code: flight['origin']?.toString() ?? '-',
                        city: flight['originCity']?.toString() ?? '-',
                        alignEnd: false,
                      ),
                    ),
                    Column(
                      children: [
                        const Icon(Icons.flight_takeoff, color: Color(0xFF1BA0E2), size: 24),
                        const SizedBox(height: 4),
                        Container(
                          width: 60,
                          height: 1.5,
                          color: Colors.grey.shade200,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          flight['duration']?.toString() ?? '-',
                          style: TextStyle(
                            color: Colors.grey.shade400,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    Expanded(
                      child: _buildAirportInfo(
                        code: flight['destination']?.toString() ?? '-',
                        city: flight['destinationCity']?.toString() ?? '-',
                        alignEnd: true,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(height: 1),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _formatDate(flight['departureTime']?.toString()),
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Berangkat: ${_formatTime(flight['departureTime']?.toString())}',
                          style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          _formatCurrency(flight['price']),
                          style: const TextStyle(
                            color: Color(0xFFF96D01),
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const Text(
                          '/ orang',
                          style: TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAirportInfo({
    required String code,
    required String city,
    required bool alignEnd,
  }) {
    return Column(
      crossAxisAlignment: alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          code,
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Color(0xFF1E293B),
            letterSpacing: -0.5,
          ),
        ),
        Text(
          city,
          style: TextStyle(
            color: Colors.grey.shade500,
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Icon(Icons.airplane_ticket_outlined, size: 80, color: Colors.blueGrey.shade100),
          const SizedBox(height: 20),
          const Text(
            'Tidak ada penerbangan ditemukan',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Coba cari rute lain atau hubungi admin.',
            style: TextStyle(color: Colors.grey),
          ),
          if (_selectedOrigin != null || _selectedDestination != null)
            Padding(
              padding: const EdgeInsets.only(top: 24),
              child: TextButton(
                onPressed: _resetFilters,
                child: const Text('Reset Filter'),
              ),
            ),
        ],
      ),
    );
  }
}
