import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android Emulator localhost bridge mapping

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<bool> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.setString('token', token);
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  // Auth: Login user
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection to server failed'};
    }
  }

  // Catalog: Search books
  static Future<Map<String, dynamic>> searchBooks(String query) async {
    try {
      final token = await getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/books/search?query=$query'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Failed to load books'};
    }
  }

  // Seat Booking: Reserve a seat
  static Future<Map<String, dynamic>> reserveSeat(String seatNumber) async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/seats/reserve'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'seatNumber': seatNumber, 'durationHours': 2}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Reservation connection failed'};
    }
  }

  // AI Chat: Send query to chatbot
  static Future<Map<String, dynamic>> chatWithLibrarian(String message) async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/ai/chat'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'content': message, 'role': 'user'}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Chatbot connection failed'};
    }
  }
}
