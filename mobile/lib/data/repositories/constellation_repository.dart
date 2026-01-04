import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mga_constellation/data/models/constellation.dart';

class ConstellationRepository {
  List<Constellation>? _cachedConstellations;

  Future<List<Constellation>> getConstellations() async {
    if (_cachedConstellations != null) return _cachedConstellations!;

    final jsonString =
        await rootBundle.loadString('assets/data/constellations.json');
    final List<dynamic> jsonList = json.decode(jsonString);
    _cachedConstellations =
        jsonList.map((json) => Constellation.fromJson(json)).toList();
    return _cachedConstellations!;
  }

  Future<Constellation?> getConstellationById(String id) async {
    final constellations = await getConstellations();
    return constellations.where((c) => c.id == id).firstOrNull;
  }

  Future<List<Constellation>> getConstellationsByType(
      ConstellationType type) async {
    final constellations = await getConstellations();
    return constellations.where((c) => c.type == type).toList();
  }
}

final constellationRepositoryProvider = Provider<ConstellationRepository>((ref) {
  return ConstellationRepository();
});

final constellationsProvider = FutureProvider<List<Constellation>>((ref) async {
  final repository = ref.watch(constellationRepositoryProvider);
  return repository.getConstellations();
});
