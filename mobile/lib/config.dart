import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

class AppConfig {
  static const String apiBaseUrlOverride = String.fromEnvironment(
    'FLIGHT_API_BASE_URL',
    defaultValue: '',
  );

  static const bool useAndroidEmulator = bool.fromEnvironment(
    'FLIGHT_USE_ANDROID_EMULATOR',
    defaultValue: false,
  );

  // PENTING: Ganti IP/Domain ini agar sesuai dengan backend yang digunakan oleh website Anda.
  // Jika website Anda bisa diakses di https://flight-web.com, maka API biasanya di https://flight-web.com/api
  static const String productionApiBaseUrl = 'http://192.168.1.7:3333/api';

  static const String appName = 'Flight Booking Pro';
  static const String appVersion = '2.0.0';
  static const int apiTimeout = 30;
  static const bool isDebugMode = true;

  static String get baseUrl {
    if (apiBaseUrlOverride.isNotEmpty) {
      return _normalizeApiBaseUrl(apiBaseUrlOverride);
    }

    if (kIsWeb) {
      return '${Uri.base.scheme}://${Uri.base.host}${Uri.base.port != 80 && Uri.base.port != 443 ? ":${Uri.base.port}" : ""}/api';
    }

    if (Platform.isAndroid) {
      // 10.0.2.2 adalah localhost untuk emulator Android.
      // Jika menggunakan HP asli, pastikan HP dan Laptop berada di jaringan WiFi yang sama
      // dan gunakan IP laptop Anda (misal: 192.168.1.5).
      return useAndroidEmulator
          ? 'http://10.0.2.2:3333/api'
          : productionApiBaseUrl;
    }

    if (Platform.isIOS) {
      return 'http://localhost:3333/api';
    }

    return productionApiBaseUrl;
  }

  static String _normalizeApiBaseUrl(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return trimmed;
    return trimmed.endsWith('/api') ? trimmed : '$trimmed/api';
  }

  static void printConfig() {
    if (!isDebugMode) return;

    debugPrint('========================================');
    debugPrint('Flight App Configuration');
    debugPrint('App: $appName v$appVersion');
    debugPrint('API URL: $baseUrl');
    debugPrint('Timeout: ${apiTimeout}s');
    debugPrint('Android emulator mode: $useAndroidEmulator');
    debugPrint('========================================');
  }
}
