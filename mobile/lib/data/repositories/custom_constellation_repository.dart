import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mga_constellation/data/models/constellation.dart';

const String _storageKey = 'custom_constellations';

final customConstellationRepositoryProvider =
    Provider<CustomConstellationRepository>((ref) {
  return CustomConstellationRepository();
});

final customConstellationsProvider =
    StateNotifierProvider<CustomConstellationsNotifier, List<Constellation>>(
        (ref) {
  final repository = ref.watch(customConstellationRepositoryProvider);
  return CustomConstellationsNotifier(repository);
});

class CustomConstellationRepository {
  Future<List<Constellation>> getCustomConstellations() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_storageKey);
    if (jsonString == null) return [];

    try {
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList
          .map((item) => Constellation.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveCustomConstellations(List<Constellation> constellations) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = constellations.map((c) => c.toJson()).toList();
    await prefs.setString(_storageKey, json.encode(jsonList));
  }

  Future<void> addConstellation(Constellation constellation) async {
    final constellations = await getCustomConstellations();
    constellations.add(constellation);
    await saveCustomConstellations(constellations);
  }

  Future<void> updateConstellation(Constellation constellation) async {
    final constellations = await getCustomConstellations();
    final index = constellations.indexWhere((c) => c.id == constellation.id);
    if (index != -1) {
      constellations[index] = constellation;
      await saveCustomConstellations(constellations);
    }
  }

  Future<void> deleteConstellation(String id) async {
    final constellations = await getCustomConstellations();
    constellations.removeWhere((c) => c.id == id);
    await saveCustomConstellations(constellations);
  }
}

class CustomConstellationsNotifier extends StateNotifier<List<Constellation>> {
  final CustomConstellationRepository _repository;

  CustomConstellationsNotifier(this._repository) : super([]) {
    _load();
  }

  Future<void> _load() async {
    state = await _repository.getCustomConstellations();
  }

  Future<void> add(Constellation constellation) async {
    await _repository.addConstellation(constellation);
    state = [...state, constellation];
  }

  Future<void> update(Constellation constellation) async {
    await _repository.updateConstellation(constellation);
    state = state.map((c) => c.id == constellation.id ? constellation : c).toList();
  }

  Future<void> delete(String id) async {
    await _repository.deleteConstellation(id);
    state = state.where((c) => c.id != id).toList();
  }

  Future<void> refresh() async {
    await _load();
  }
}
