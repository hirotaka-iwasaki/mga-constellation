import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String _baseUrl = 'https://mga-constellation.pages.dev';

  // 投票数を取得
  static Future<Map<String, int>> getVotes() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/votes'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final votes = data['votes'] as Map<String, dynamic>?;
        if (votes != null) {
          return votes.map((key, value) => MapEntry(key, value as int));
        }
      }
      return {};
    } catch (e) {
      print('Failed to fetch votes: $e');
      return {};
    }
  }

  // アイデアに投票
  static Future<int?> vote(String ideaId) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/vote'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'ideaId': ideaId}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['votes'] as int?;
        }
      }
      return null;
    } catch (e) {
      print('Failed to vote: $e');
      return null;
    }
  }

  // フィードバック送信
  static Future<bool> submitFeedback({
    required String message,
    required String type,
    String platform = 'ios',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/feedback'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
          'type': type,
          'platform': platform,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      print('Failed to submit feedback: $e');
      return false;
    }
  }
}
