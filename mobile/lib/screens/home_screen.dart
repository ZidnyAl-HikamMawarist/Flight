import 'package:flutter/material.dart';
import '../api_service.dart';
import 'login_screen.dart';
import 'flight_detail_screen.dart';
import 'booking_history_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _flights = [];
  List<dynamic> _airports = [];
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
      
      setState(() {
        _flights = results[0] as List<dynamic>;
        _airports = results[1] as List<dynamic>;
        _user = results[2] as Map<String, dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load data')),
      );
    }
  }

  Future<void> _searchFlights() async {
    setState(() => _isLoading = true);
    try {
      final flights = await ApiService.getFlights(
        origin: _selectedOrigin,
        destination: _selectedDestination,
      );
      setState(() {
        _flights = flights;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _logout() async {
    await ApiService.removeToken();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF5F7F9),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.blue[900],
        title: Text('Find Your Flight', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: IconThemeData(color: Colors.white),
      ),
      drawer: Drawer(
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: BoxDecoration(color: Colors.blue[900]),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.person, size: 40, color: Colors.blue[900]),
              ),
              accountName: Text(_user?['fullName'] ?? 'User'),
              accountEmail: Text(_user?['email'] ?? ''),
            ),
            ListTile(
              leading: Icon(Icons.history),
              title: Text('My Bookings'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => BookingHistoryScreen()),
                );
              },
            ),
            Spacer(),
            Divider(),
            ListTile(
              leading: Icon(Icons.logout, color: Colors.red),
              title: Text('Logout', style: TextStyle(color: Colors.red)),
              onTap: _logout,
            ),
            SizedBox(height: 20),
          ],
        ),
      ),
      body: Column(
        children: [
          _buildSearchHeader(),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator())
                : _flights.isEmpty
                    ? _buildEmptyState()
                    : _buildFlightList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[900],
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildAirportDropdown(
                  'From',
                  _selectedOrigin,
                  (val) => setState(() => _selectedOrigin = val),
                ),
              ),
              SizedBox(width: 12),
              Icon(Icons.swap_horiz, color: Colors.white),
              SizedBox(width: 12),
              Expanded(
                child: _buildAirportDropdown(
                  'To',
                  _selectedDestination,
                  (val) => setState(() => _selectedDestination = val),
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _searchFlights,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange[800],
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('Search Flights', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAirportDropdown(String label, String? value, Function(String?) onChanged) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          hint: Text(label, style: TextStyle(color: Colors.white70)),
          dropdownColor: Colors.blue[900],
          icon: Icon(Icons.arrow_drop_down, color: Colors.white),
          style: TextStyle(color: Colors.white),
          isExpanded: true,
          onChanged: onChanged,
          items: _airports.map((airport) {
            return DropdownMenuItem<String>(
              value: airport['code'],
              child: Text('${airport['city']} (${airport['code']})'),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.flight_takeoff, size: 80, color: Colors.grey[400]),
          SizedBox(height: 16),
          Text('No flights found', style: TextStyle(fontSize: 18, color: Colors.grey[600])),
          TextButton(
            onPressed: () {
              setState(() {
                _selectedOrigin = null;
                _selectedDestination = null;
              });
              _searchFlights();
            },
            child: Text('Clear Filters'),
          ),
        ],
      ),
    );
  }

  Widget _buildFlightList() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: _flights.length,
      itemBuilder: (context, index) {
        final flight = _flights[index];
        return Card(
          elevation: 4,
          margin: EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => FlightDetailScreen(flight: flight),
                ),
              );
            },
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(flight['origin'] ?? '', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          Text(flight['originCity'] ?? '', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                      Column(
                        children: [
                          Icon(Icons.flight_takeoff, color: Colors.blue),
                          Container(width: 80, height: 1, color: Colors.grey[300]),
                          Text(flight['duration'] ?? '', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(flight['destination'] ?? '', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          Text(flight['destinationCity'] ?? '', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ],
                  ),
                  Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                          SizedBox(width: 4),
                          Text(flight['departureTime']?.toString().split('T')[0] ?? '', style: TextStyle(fontSize: 12)),
                        ],
                      ),
                      Text(
                        'Rp ${flight['price'] ?? ''}',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange[800]),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
