import 'package:flutter/material.dart';
import 'seat_selection_screen.dart';

class FlightDetailScreen extends StatelessWidget {
  final Map<String, dynamic> flight;

  FlightDetailScreen({required this.flight});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flight Details'),
        backgroundColor: Colors.blue[900],
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeroSection(),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Route Information'),
                  _buildInfoCard([
                    _buildInfoRow(Icons.flight_takeoff, 'Origin', '${flight['originCity']} (${flight['origin']})'),
                    _buildInfoRow(Icons.flight_land, 'Destination', '${flight['destinationCity']} (${flight['destination']})'),
                    _buildInfoRow(Icons.access_time, 'Duration', flight['duration'] ?? '-'),
                  ]),
                  SizedBox(height: 16),
                  _buildSectionTitle('Schedule'),
                  _buildInfoCard([
                    _buildInfoRow(Icons.calendar_today, 'Departure Date', flight['departureTime']?.toString().split('T')[0] ?? '-'),
                    _buildInfoRow(Icons.watch_later_outlined, 'Departure Time', flight['departureTime']?.toString().split('T')[1].substring(0, 5) ?? '-'),
                  ]),
                  SizedBox(height: 16),
                  _buildSectionTitle('Aircraft'),
                  _buildInfoCard([
                    _buildInfoRow(Icons.airplanemode_active, 'Model', flight['aircraftModel'] ?? 'Boeing 737-800'),
                    _buildInfoRow(Icons.confirmation_number, 'Flight Number', flight['flightCall'] ?? '-'),
                  ]),
                  SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => SeatSelectionScreen(flight: flight),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange[800],
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 4,
                      ),
                      child: Text('Select Seats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.blue[900]!, Colors.blue[600]!],
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildLargeCode(flight['origin'] ?? '', flight['originCity'] ?? ''),
              Icon(Icons.flight_takeoff, color: Colors.white, size: 32),
              _buildLargeCode(flight['destination'] ?? '', flight['destinationCity'] ?? ''),
            ],
          ),
          SizedBox(height: 24),
          Text(
            'Starting from Rp ${flight['price'] ?? ''}',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildLargeCode(String code, String city) {
    return Column(
      children: [
        Text(code, style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold)),
        Text(city, style: TextStyle(color: Colors.white70, fontSize: 16)),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title,
        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blue[900]),
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(children: children),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.blue),
          SizedBox(width: 12),
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Spacer(),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
