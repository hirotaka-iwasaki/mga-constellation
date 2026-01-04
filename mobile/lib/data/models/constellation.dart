import 'package:freezed_annotation/freezed_annotation.dart';

part 'constellation.freezed.dart';
part 'constellation.g.dart';

enum ConstellationType {
  @JsonValue('album')
  album,
  @JsonValue('live')
  live,
  @JsonValue('theme')
  theme,
}

@freezed
class Constellation with _$Constellation {
  const factory Constellation({
    required String id,
    required String name,
    String? shortName,
    required ConstellationType type,
    required int year,
    String? date,
    required String color,
    required List<String> songs,
  }) = _Constellation;

  factory Constellation.fromJson(Map<String, dynamic> json) =>
      _$ConstellationFromJson(json);
}
