import 'package:freezed_annotation/freezed_annotation.dart';

part 'star_position.freezed.dart';
part 'star_position.g.dart';

@freezed
class StarPosition with _$StarPosition {
  const factory StarPosition({
    required String id,
    required double x,
    required double y,
  }) = _StarPosition;

  factory StarPosition.fromJson(Map<String, dynamic> json) =>
      _$StarPositionFromJson(json);
}
