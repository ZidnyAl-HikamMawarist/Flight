import 'dart:convert';
import 'dart:async';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'config.dart';

class ApiService {
  static String get baseUrl => AppConfig.baseUrl;

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<Map<String, String>> _getHeaders({
    bool includeAuth = true,
  }) async {
    final token = includeAuth ? await getToken() : null;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static Uri _buildUri(
    String path, [
    Map<String, String?> queryParameters = const {},
  ]) {
    final sanitizedQuery = <String, String>{};
    for (final entry in queryParameters.entries) {
      final value = entry.value?.trim();
      if (value != null && value.isNotEmpty) {
        sanitizedQuery[entry.key] = value;
      }
    }

    final uri = Uri.parse('$baseUrl$path');
    return uri.replace(
      queryParameters: sanitizedQuery.isEmpty ? null : sanitizedQuery,
    );
  }

  static dynamic _decodeBody(http.Response response) {
    if (response.body.isEmpty) return null;
    return json.decode(response.body);
  }

  static String? _extractToken(dynamic rawToken) {
    if (rawToken is String && rawToken.isNotEmpty) {
      return rawToken;
    }

    if (rawToken is Map<String, dynamic>) {
      final nestedToken = rawToken['token'];
      if (nestedToken is String && nestedToken.isNotEmpty) {
        return nestedToken;
      }
    }

    return null;
  }

  static num? _asNum(dynamic value) {
    if (value is num) return value;
    if (value is String) return num.tryParse(value);
    return null;
  }

  static String _buildDuration(String? departureTime, String? arrivalTime) {
    final departure = departureTime == null ? null : DateTime.tryParse(departureTime);
    final arrival = arrivalTime == null ? null : DateTime.tryParse(arrivalTime);

    if (departure == null || arrival == null) return '-';

    final difference = arrival.difference(departure);
    if (difference.isNegative) return '-';

    final hours = difference.inHours;
    final minutes = difference.inMinutes.remainder(60);
    if (hours == 0) return '${minutes}m';
    return '${hours}j ${minutes}m';
  }

  static Map<String, dynamic> _normalizeAirport(dynamic rawAirport) {
    final airport = Map<String, dynamic>.from(rawAirport as Map);
    final code = airport['iataAirportCode']?.toString() ?? airport['code']?.toString() ?? '';
    final city = airport['city']?.toString() ?? '';
    final name = airport['name']?.toString() ?? '';

    return {
      ...airport,
      'code': code,
      'iataAirportCode': code,
      'city': city,
      'name': name,
      'label': city.isEmpty ? code : '$city ($code)',
    };
  }

  static Map<String, dynamic> _normalizeFlight(dynamic rawFlight) {
    final flight = Map<String, dynamic>.from(rawFlight as Map);
    final schedule = Map<String, dynamic>.from(
      (flight['schedule'] as Map?)?.cast<String, dynamic>() ?? const {},
    );
    final originAirport = _normalizeAirport(schedule['originAirport'] ?? const {});
    final destinationAirport = _normalizeAirport(schedule['destinationAirport'] ?? const {});
    final departureTime = schedule['departureTime']?.toString() ?? flight['departureTime']?.toString();
    final arrivalTime = schedule['arrivalTime']?.toString() ?? flight['arrivalTime']?.toString();
    
    // Try multiple possible price field names
    final minPrice = _asNum(flight['minPrice']) ?? 
                     _asNum(flight['price']) ?? 
                     _asNum(flight['basePrice']) ?? 
                     _asNum(flight['startingPrice']) ?? 
                     _asNum(schedule['price']) ?? 
                     0;
    
    final status = Map<String, dynamic>.from(
      (flight['status'] as Map?)?.cast<String, dynamic>() ?? const {},
    );

    return {
      ...flight,
      'schedule': {
        ...schedule,
        'originAirport': originAirport,
        'destinationAirport': destinationAirport,
      },
      'status': status,
      'statusName': status['name']?.toString() ?? flight['statusName']?.toString() ?? 'Scheduled',
      'origin': originAirport['code'],
      'originCity': originAirport['city'],
      'originName': originAirport['name'],
      'destination': destinationAirport['code'],
      'destinationCity': destinationAirport['city'],
      'destinationName': destinationAirport['name'],
      'departureTime': departureTime,
      'arrivalTime': arrivalTime,
      'duration': _buildDuration(departureTime, arrivalTime),
      'price': minPrice,
      'minPrice': minPrice,
      'aircraftModel': flight['aircraftModel']?.toString() ??
          (flight['aircraft'] is Map ? flight['aircraft']['name']?.toString() : null) ??
          'Aircraft',
    };
  }

  static Map<String, dynamic> _normalizeSeat(dynamic rawSeat) {
    final seat = Map<String, dynamic>.from(rawSeat as Map);
    return {
      ...seat,
      'seatId': seat['seatId']?.toString() ?? '',
      'className': seat['className']?.toString() ?? 'Economy',
      'isAvailable': seat['isAvailable'] == true,
      'price': _asNum(seat['price']) ?? 0,
    };
  }

  static Map<String, dynamic> _normalizeBooking(dynamic rawBooking) {
    final booking = Map<String, dynamic>.from(rawBooking as Map);
    final rawFlight = booking['flight'];
    final flight = rawFlight is Map<String, dynamic>
        ? _normalizeFlight(rawFlight)
        : rawFlight is Map
            ? _normalizeFlight(Map<String, dynamic>.from(rawFlight))
            : <String, dynamic>{};
    final amount = _asNum(booking['paymentAmount']) ?? _asNum(flight['minPrice']);

    return {
      ...booking,
      'flight': flight,
      'paymentAmount': amount,
      'origin': flight['origin'],
      'destination': flight['destination'],
      'originCity': flight['originCity'],
      'destinationCity': flight['destinationCity'],
      'departureTime': flight['departureTime'],
      'statusName': flight['statusName'],
    };
  }

  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    try {
      final response = await http
          .post(
            _buildUri('/auth/login'),
            headers: await _getHeaders(includeAuth: false),
            body: json.encode({'email': email.trim(), 'password': password}),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      final data = (_decodeBody(response) ?? <String, dynamic>{}) as Map<String, dynamic>;
      final token = _extractToken(data['token']);

      if (response.statusCode == 200 && token != null) {
        await saveToken(token);
        return {'success': true, 'data': data, 'token': token};
      }

      if (response.statusCode == 401) {
        return {
          'success': false,
          'message': '❌ Email atau password salah. Coba lagi.',
        };
      }

      return {
        'success': false,
        'message': data['message']?.toString() ?? '❌ Login gagal',
      };
    } on TimeoutException catch (_) {
      return {
        'success': false,
        'message': '❌ Koneksi timeout. Backend di $baseUrl tidak merespons. Pastikan backend aktif.',
      };
    } catch (error) {
      return {
        'success': false,
        'message': '❌ Gagal terhubung ke server.\nPastikan backend aktif di $baseUrl\n\nError: ${error.toString()}',
      };
    }
  }

  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
  ) async {
    try {
      final response = await http
          .post(
            _buildUri('/auth/register'),
            headers: await _getHeaders(includeAuth: false),
            body: json.encode({
              'fullName': name.trim(),
              'email': email.trim(),
              'password': password,
            }),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      final data = (_decodeBody(response) ?? <String, dynamic>{}) as Map<String, dynamic>;
      final token = _extractToken(data['token']);

      if ((response.statusCode == 200 || response.statusCode == 201) && token != null) {
        await saveToken(token);
        return {'success': true, 'data': data, 'token': token};
      }

      if (response.statusCode == 422 || response.statusCode == 400) {
        final message = data['message']?.toString() ?? 'Data tidak valid';
        if (message.contains('email') || message.contains('Email')) {
          return {
            'success': false,
            'message': '❌ Email sudah terdaftar. Gunakan email lain atau login.',
          };
        }
        return {
          'success': false,
          'message': '❌ $message',
        };
      }

      return {
        'success': false,
        'message': data['message']?.toString() ?? '❌ Registrasi gagal',
      };
    } on TimeoutException catch (_) {
      return {
        'success': false,
        'message': '❌ Koneksi timeout. Backend di $baseUrl tidak merespons.',
      };
    } catch (error) {
      return {
        'success': false,
        'message': '❌ Gagal terhubung ke server.\nPastikan backend aktif di $baseUrl',
      };
    }
  }

  static Future<Map<String, dynamic>> getMe() async {
    try {
      final response = await http
          .get(
            _buildUri('/auth/me'),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      if (response.statusCode == 401) {
        throw Exception('❌ Token tidak valid atau sudah kadaluarsa');
      }

      if (response.statusCode != 200) {
        throw Exception('❌ Gagal mengambil profil pengguna (HTTP ${response.statusCode})');
      }

      return Map<String, dynamic>.from(_decodeBody(response) as Map);
    } on TimeoutException {
      throw Exception('❌ Koneksi timeout. Backend tidak merespons.');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  static Future<List<dynamic>> getFlights({
    String? origin,
    String? destination,
  }) async {
    try {
      final response = await http
          .get(
            _buildUri('/flights', {
              'origin': origin,
              'destination': destination,
            }),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      if (response.statusCode != 200) return [];

      final data = _decodeBody(response);
      final flights = data is List ? data : (data['data'] as List? ?? const []);
      return flights.map(_normalizeFlight).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<List<dynamic>> getAirports({String? from}) async {
    try {
      final response = await http
          .get(
            _buildUri('/airports', {'from': from}),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      if (response.statusCode != 200) return [];

      final data = _decodeBody(response);
      final airports = data is List ? data : (data['data'] as List? ?? const []);
      return airports.map(_normalizeAirport).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> createBooking(
    Map<String, dynamic> bookingData,
  ) async {
    try {
      final response = await http
          .post(
            _buildUri('/bookings'),
            headers: await _getHeaders(),
            body: json.encode(bookingData),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      final data = (_decodeBody(response) ?? <String, dynamic>{}) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': data};
      }

      if (response.statusCode == 409 || response.statusCode == 422) {
        return {
          'success': false,
          'message': data['message']?.toString() ?? 'Kursi sudah terpesan atau data tidak valid',
        };
      }

      if (response.statusCode == 401) {
        return {
          'success': false,
          'message': '❌ Session berakhir. Silakan login kembali.',
        };
      }

      return {
        'success': false,
        'message': data['message']?.toString() ?? 'Booking gagal dibuat (HTTP ${response.statusCode})',
      };
    } on TimeoutException {
      return {
        'success': false,
        'message': '❌ Koneksi timeout. Backend tidak merespons. Coba lagi.',
      };
    } catch (error) {
      return {
        'success': false,
        'message': 'Booking gagal dibuat. Cek koneksi ke $baseUrl\n\nError: ${error.toString()}',
      };
    }
  }

  static Future<List<dynamic>> getBookingHistory({String? email}) async {
    try {
      var resolvedEmail = email?.trim();
      if (resolvedEmail == null || resolvedEmail.isEmpty) {
        final me = await getMe();
        resolvedEmail = me['email']?.toString();
      }

      if (resolvedEmail == null || resolvedEmail.isEmpty) {
        return [];
      }

      final response = await http
          .get(
            _buildUri('/bookings/history', {'email': resolvedEmail}),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      if (response.statusCode != 200) return [];

      final data = _decodeBody(response);
      final bookings = data is List ? data : (data['data'] as List? ?? const []);
      return bookings.map(_normalizeBooking).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<List<dynamic>> getSeats(String flightCall) async {
    try {
      final response = await http
          .get(
            _buildUri('/flights/$flightCall/seats'),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeout));

      if (response.statusCode != 200) return [];

      final data = _decodeBody(response);
      final seats = data is List ? data : (data['data'] as List? ?? const []);
      return seats.map(_normalizeSeat).toList();
    } catch (_) {
      return [];
    }
  }
}


