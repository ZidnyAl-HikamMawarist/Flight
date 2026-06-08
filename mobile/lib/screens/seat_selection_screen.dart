import 'package:flutter/material.dart';
import '../api_service.dart';

class SeatSelectionScreen extends StatefulWidget {
  final Map<String, dynamic> flight;

  SeatSelectionScreen({required this.flight});

  @override
  _SeatSelectionScreenState createState() => _SeatSelectionScreenState();
}

class _SeatSelectionScreenState extends State<SeatSelectionScreen> {
  List<dynamic> _seats = [];
  bool _isLoading = true;
  String? _selectedSeatId;
  double? _selectedPrice;

  @override
  void initState() {
    super.initState();
    _loadSeats();
  }

  Future<void> _loadSeats() async {
    try {
      final seats = await ApiService.getSeats(widget.flight['flightCall']);
      setState(() {
        _seats = seats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load seats')),
      );
    }
  }

  void _confirmSelection() {
    if (_selectedSeatId == null) return;
    
    // For now, just show a dialog. In real app, navigate to passenger info.
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      builder: (context) => _buildBookingForm(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Select Seat'),
        backgroundColor: Colors.blue[900],
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildLegend(),
                Expanded(child: _buildSeatGrid()),
                _buildBottomBar(),
              ],
            ),
    );
  }

  Widget _buildLegend() {
    return Container(
      padding: EdgeInsets.all(16),
      color: Colors.grey[100],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _legendItem(Colors.white, 'Available', border: true),
          _legendItem(Colors.grey[400]!, 'Booked'),
          _legendItem(Colors.orange, 'Selected'),
        ],
      ),
    );
  }

  Widget _legendItem(Color color, String label, {bool border = false}) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
            border: border ? Border.all(color: Colors.grey) : null,
          ),
        ),
        SizedBox(width: 8),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildSeatGrid() {
    return GridView.builder(
      padding: EdgeInsets.all(24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 6, // Assuming 6 seats per row
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
      ),
      itemCount: _seats.length,
      itemBuilder: (context, index) {
        final seat = _seats[index];
        final isSelected = _selectedSeatId == seat['seatId'];
        final isAvailable = seat['isAvailable'];

        return GestureDetector(
          onTap: isAvailable
              ? () {
                  setState(() {
                    _selectedSeatId = seat['seatId'];
                    _selectedPrice = double.tryParse(seat['price'].toString());
                  });
                }
              : null,
          child: Container(
            decoration: BoxDecoration(
              color: !isAvailable
                  ? Colors.grey[400]
                  : isSelected
                      ? Colors.orange
                      : Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected ? Colors.orange[800]! : Colors.grey[300]!,
                width: 2,
              ),
              boxShadow: isSelected
                  ? [BoxShadow(color: Colors.orange.withOpacity(0.3), blurRadius: 4, spreadRadius: 1)]
                  : null,
            ),
            child: Center(
              child: Text(
                seat['seatId'],
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: !isAvailable || isSelected ? Colors.white : Colors.black,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Selected: ${_selectedSeatId ?? '-'}', style: TextStyle(color: Colors.grey)),
              Text(
                'Rp ${_selectedPrice?.toStringAsFixed(0) ?? '0'}',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blue[900]),
              ),
            ],
          ),
          ElevatedButton(
            onPressed: _selectedSeatId != null ? _confirmSelection : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[900],
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Book Now'),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingForm() {
    final _firstNameController = TextEditingController();
    final _lastNameController = TextEditingController();
    final _phoneController = TextEditingController();
    final _emailController = TextEditingController();

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 24,
        right: 24,
        top: 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Passenger Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          SizedBox(height: 20),
          TextField(controller: _firstNameController, decoration: InputDecoration(labelText: 'First Name')),
          TextField(controller: _lastNameController, decoration: InputDecoration(labelText: 'Last Name')),
          TextField(controller: _emailController, decoration: InputDecoration(labelText: 'Email')),
          TextField(controller: _phoneController, decoration: InputDecoration(labelText: 'Phone')),
          SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () async {
                final bookingData = {
                  'flightCall': widget.flight['flightCall'],
                  'aircraftId': widget.flight['aircraftId'],
                  'seatId': _selectedSeatId,
                  'passenger': {
                    'firstName': _firstNameController.text,
                    'lastName': _lastNameController.text,
                    'email': _emailController.text,
                    'phone': _phoneController.text,
                  }
                };
                
                final result = await ApiService.createBooking(bookingData);
                if (result['success']) {
                  Navigator.pop(context); // Close bottom sheet
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Booking Successful!')));
                  Navigator.pop(context); // Back to details
                  Navigator.pop(context); // Back to home
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'])));
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[900], foregroundColor: Colors.white),
              child: Text('Confirm Booking'),
            ),
          ),
          SizedBox(height: 24),
        ],
      ),
    );
  }
}
