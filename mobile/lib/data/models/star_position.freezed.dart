// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'star_position.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

StarPosition _$StarPositionFromJson(Map<String, dynamic> json) {
  return _StarPosition.fromJson(json);
}

/// @nodoc
mixin _$StarPosition {
  String get id => throw _privateConstructorUsedError;
  double get x => throw _privateConstructorUsedError;
  double get y => throw _privateConstructorUsedError;

  /// Serializes this StarPosition to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of StarPosition
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $StarPositionCopyWith<StarPosition> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $StarPositionCopyWith<$Res> {
  factory $StarPositionCopyWith(
    StarPosition value,
    $Res Function(StarPosition) then,
  ) = _$StarPositionCopyWithImpl<$Res, StarPosition>;
  @useResult
  $Res call({String id, double x, double y});
}

/// @nodoc
class _$StarPositionCopyWithImpl<$Res, $Val extends StarPosition>
    implements $StarPositionCopyWith<$Res> {
  _$StarPositionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of StarPosition
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null, Object? x = null, Object? y = null}) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            x: null == x
                ? _value.x
                : x // ignore: cast_nullable_to_non_nullable
                      as double,
            y: null == y
                ? _value.y
                : y // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$StarPositionImplCopyWith<$Res>
    implements $StarPositionCopyWith<$Res> {
  factory _$$StarPositionImplCopyWith(
    _$StarPositionImpl value,
    $Res Function(_$StarPositionImpl) then,
  ) = __$$StarPositionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, double x, double y});
}

/// @nodoc
class __$$StarPositionImplCopyWithImpl<$Res>
    extends _$StarPositionCopyWithImpl<$Res, _$StarPositionImpl>
    implements _$$StarPositionImplCopyWith<$Res> {
  __$$StarPositionImplCopyWithImpl(
    _$StarPositionImpl _value,
    $Res Function(_$StarPositionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of StarPosition
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null, Object? x = null, Object? y = null}) {
    return _then(
      _$StarPositionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        x: null == x
            ? _value.x
            : x // ignore: cast_nullable_to_non_nullable
                  as double,
        y: null == y
            ? _value.y
            : y // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$StarPositionImpl implements _StarPosition {
  const _$StarPositionImpl({
    required this.id,
    required this.x,
    required this.y,
  });

  factory _$StarPositionImpl.fromJson(Map<String, dynamic> json) =>
      _$$StarPositionImplFromJson(json);

  @override
  final String id;
  @override
  final double x;
  @override
  final double y;

  @override
  String toString() {
    return 'StarPosition(id: $id, x: $x, y: $y)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$StarPositionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.x, x) || other.x == x) &&
            (identical(other.y, y) || other.y == y));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, x, y);

  /// Create a copy of StarPosition
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$StarPositionImplCopyWith<_$StarPositionImpl> get copyWith =>
      __$$StarPositionImplCopyWithImpl<_$StarPositionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$StarPositionImplToJson(this);
  }
}

abstract class _StarPosition implements StarPosition {
  const factory _StarPosition({
    required final String id,
    required final double x,
    required final double y,
  }) = _$StarPositionImpl;

  factory _StarPosition.fromJson(Map<String, dynamic> json) =
      _$StarPositionImpl.fromJson;

  @override
  String get id;
  @override
  double get x;
  @override
  double get y;

  /// Create a copy of StarPosition
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$StarPositionImplCopyWith<_$StarPositionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
