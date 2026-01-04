import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mga_constellation/data/models/song.dart';
import 'package:mga_constellation/data/models/star_position.dart';
import 'package:mga_constellation/data/models/song_essence.dart';

class SongRepository {
  List<Song>? _cachedSongs;
  List<StarPosition>? _cachedPositions;
  Map<String, SongEssence>? _cachedEssences;

  Future<List<Song>> getSongs() async {
    if (_cachedSongs != null) return _cachedSongs!;

    final jsonString = await rootBundle.loadString('assets/data/songs.json');
    final List<dynamic> jsonList = json.decode(jsonString);
    _cachedSongs = jsonList.map((json) => Song.fromJson(json)).toList();
    return _cachedSongs!;
  }

  Future<List<StarPosition>> getPositions() async {
    if (_cachedPositions != null) return _cachedPositions!;

    final jsonString =
        await rootBundle.loadString('assets/data/positions.json');
    final List<dynamic> jsonList = json.decode(jsonString);
    _cachedPositions =
        jsonList.map((json) => StarPosition.fromJson(json)).toList();
    return _cachedPositions!;
  }

  Future<Song?> getSongById(String id) async {
    final songs = await getSongs();
    return songs.where((s) => s.id == id).firstOrNull;
  }

  Future<StarPosition?> getPositionById(String id) async {
    final positions = await getPositions();
    return positions.where((p) => p.id == id).firstOrNull;
  }

  Future<Map<String, SongEssence>> getEssences() async {
    if (_cachedEssences != null) return _cachedEssences!;

    final jsonString =
        await rootBundle.loadString('assets/data/essences.json');
    final Map<String, dynamic> jsonMap = json.decode(jsonString);
    _cachedEssences = jsonMap.map((key, value) =>
        MapEntry(key, SongEssence.fromJson(value as Map<String, dynamic>)));
    return _cachedEssences!;
  }

  Future<SongEssence?> getEssenceById(String id) async {
    final essences = await getEssences();
    return essences[id];
  }
}

final songRepositoryProvider = Provider<SongRepository>((ref) {
  return SongRepository();
});

final songsProvider = FutureProvider<List<Song>>((ref) async {
  final repository = ref.watch(songRepositoryProvider);
  return repository.getSongs();
});

final positionsProvider = FutureProvider<List<StarPosition>>((ref) async {
  final repository = ref.watch(songRepositoryProvider);
  return repository.getPositions();
});

final essencesProvider = FutureProvider<Map<String, SongEssence>>((ref) async {
  final repository = ref.watch(songRepositoryProvider);
  return repository.getEssences();
});
