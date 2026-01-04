// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'song_essence.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

LyricsAnalysis _$LyricsAnalysisFromJson(Map<String, dynamic> json) {
  return _LyricsAnalysis.fromJson(json);
}

/// @nodoc
mixin _$LyricsAnalysis {
  List<String> get keywords => throw _privateConstructorUsedError;
  List<String> get motifs => throw _privateConstructorUsedError;
  List<String> get metaphors => throw _privateConstructorUsedError;

  /// Serializes this LyricsAnalysis to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LyricsAnalysis
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LyricsAnalysisCopyWith<LyricsAnalysis> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LyricsAnalysisCopyWith<$Res> {
  factory $LyricsAnalysisCopyWith(
    LyricsAnalysis value,
    $Res Function(LyricsAnalysis) then,
  ) = _$LyricsAnalysisCopyWithImpl<$Res, LyricsAnalysis>;
  @useResult
  $Res call({
    List<String> keywords,
    List<String> motifs,
    List<String> metaphors,
  });
}

/// @nodoc
class _$LyricsAnalysisCopyWithImpl<$Res, $Val extends LyricsAnalysis>
    implements $LyricsAnalysisCopyWith<$Res> {
  _$LyricsAnalysisCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LyricsAnalysis
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? keywords = null,
    Object? motifs = null,
    Object? metaphors = null,
  }) {
    return _then(
      _value.copyWith(
            keywords: null == keywords
                ? _value.keywords
                : keywords // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            motifs: null == motifs
                ? _value.motifs
                : motifs // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            metaphors: null == metaphors
                ? _value.metaphors
                : metaphors // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$LyricsAnalysisImplCopyWith<$Res>
    implements $LyricsAnalysisCopyWith<$Res> {
  factory _$$LyricsAnalysisImplCopyWith(
    _$LyricsAnalysisImpl value,
    $Res Function(_$LyricsAnalysisImpl) then,
  ) = __$$LyricsAnalysisImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<String> keywords,
    List<String> motifs,
    List<String> metaphors,
  });
}

/// @nodoc
class __$$LyricsAnalysisImplCopyWithImpl<$Res>
    extends _$LyricsAnalysisCopyWithImpl<$Res, _$LyricsAnalysisImpl>
    implements _$$LyricsAnalysisImplCopyWith<$Res> {
  __$$LyricsAnalysisImplCopyWithImpl(
    _$LyricsAnalysisImpl _value,
    $Res Function(_$LyricsAnalysisImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LyricsAnalysis
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? keywords = null,
    Object? motifs = null,
    Object? metaphors = null,
  }) {
    return _then(
      _$LyricsAnalysisImpl(
        keywords: null == keywords
            ? _value._keywords
            : keywords // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        motifs: null == motifs
            ? _value._motifs
            : motifs // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        metaphors: null == metaphors
            ? _value._metaphors
            : metaphors // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$LyricsAnalysisImpl implements _LyricsAnalysis {
  const _$LyricsAnalysisImpl({
    required final List<String> keywords,
    required final List<String> motifs,
    required final List<String> metaphors,
  }) : _keywords = keywords,
       _motifs = motifs,
       _metaphors = metaphors;

  factory _$LyricsAnalysisImpl.fromJson(Map<String, dynamic> json) =>
      _$$LyricsAnalysisImplFromJson(json);

  final List<String> _keywords;
  @override
  List<String> get keywords {
    if (_keywords is EqualUnmodifiableListView) return _keywords;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_keywords);
  }

  final List<String> _motifs;
  @override
  List<String> get motifs {
    if (_motifs is EqualUnmodifiableListView) return _motifs;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_motifs);
  }

  final List<String> _metaphors;
  @override
  List<String> get metaphors {
    if (_metaphors is EqualUnmodifiableListView) return _metaphors;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_metaphors);
  }

  @override
  String toString() {
    return 'LyricsAnalysis(keywords: $keywords, motifs: $motifs, metaphors: $metaphors)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LyricsAnalysisImpl &&
            const DeepCollectionEquality().equals(other._keywords, _keywords) &&
            const DeepCollectionEquality().equals(other._motifs, _motifs) &&
            const DeepCollectionEquality().equals(
              other._metaphors,
              _metaphors,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_keywords),
    const DeepCollectionEquality().hash(_motifs),
    const DeepCollectionEquality().hash(_metaphors),
  );

  /// Create a copy of LyricsAnalysis
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LyricsAnalysisImplCopyWith<_$LyricsAnalysisImpl> get copyWith =>
      __$$LyricsAnalysisImplCopyWithImpl<_$LyricsAnalysisImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$LyricsAnalysisImplToJson(this);
  }
}

abstract class _LyricsAnalysis implements LyricsAnalysis {
  const factory _LyricsAnalysis({
    required final List<String> keywords,
    required final List<String> motifs,
    required final List<String> metaphors,
  }) = _$LyricsAnalysisImpl;

  factory _LyricsAnalysis.fromJson(Map<String, dynamic> json) =
      _$LyricsAnalysisImpl.fromJson;

  @override
  List<String> get keywords;
  @override
  List<String> get motifs;
  @override
  List<String> get metaphors;

  /// Create a copy of LyricsAnalysis
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LyricsAnalysisImplCopyWith<_$LyricsAnalysisImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RelatedQuote _$RelatedQuoteFromJson(Map<String, dynamic> json) {
  return _RelatedQuote.fromJson(json);
}

/// @nodoc
mixin _$RelatedQuote {
  String get source => throw _privateConstructorUsedError;
  String get quote => throw _privateConstructorUsedError;

  /// Serializes this RelatedQuote to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RelatedQuote
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RelatedQuoteCopyWith<RelatedQuote> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RelatedQuoteCopyWith<$Res> {
  factory $RelatedQuoteCopyWith(
    RelatedQuote value,
    $Res Function(RelatedQuote) then,
  ) = _$RelatedQuoteCopyWithImpl<$Res, RelatedQuote>;
  @useResult
  $Res call({String source, String quote});
}

/// @nodoc
class _$RelatedQuoteCopyWithImpl<$Res, $Val extends RelatedQuote>
    implements $RelatedQuoteCopyWith<$Res> {
  _$RelatedQuoteCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RelatedQuote
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? source = null, Object? quote = null}) {
    return _then(
      _value.copyWith(
            source: null == source
                ? _value.source
                : source // ignore: cast_nullable_to_non_nullable
                      as String,
            quote: null == quote
                ? _value.quote
                : quote // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RelatedQuoteImplCopyWith<$Res>
    implements $RelatedQuoteCopyWith<$Res> {
  factory _$$RelatedQuoteImplCopyWith(
    _$RelatedQuoteImpl value,
    $Res Function(_$RelatedQuoteImpl) then,
  ) = __$$RelatedQuoteImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String source, String quote});
}

/// @nodoc
class __$$RelatedQuoteImplCopyWithImpl<$Res>
    extends _$RelatedQuoteCopyWithImpl<$Res, _$RelatedQuoteImpl>
    implements _$$RelatedQuoteImplCopyWith<$Res> {
  __$$RelatedQuoteImplCopyWithImpl(
    _$RelatedQuoteImpl _value,
    $Res Function(_$RelatedQuoteImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RelatedQuote
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? source = null, Object? quote = null}) {
    return _then(
      _$RelatedQuoteImpl(
        source: null == source
            ? _value.source
            : source // ignore: cast_nullable_to_non_nullable
                  as String,
        quote: null == quote
            ? _value.quote
            : quote // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RelatedQuoteImpl implements _RelatedQuote {
  const _$RelatedQuoteImpl({required this.source, required this.quote});

  factory _$RelatedQuoteImpl.fromJson(Map<String, dynamic> json) =>
      _$$RelatedQuoteImplFromJson(json);

  @override
  final String source;
  @override
  final String quote;

  @override
  String toString() {
    return 'RelatedQuote(source: $source, quote: $quote)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RelatedQuoteImpl &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.quote, quote) || other.quote == quote));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, source, quote);

  /// Create a copy of RelatedQuote
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RelatedQuoteImplCopyWith<_$RelatedQuoteImpl> get copyWith =>
      __$$RelatedQuoteImplCopyWithImpl<_$RelatedQuoteImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RelatedQuoteImplToJson(this);
  }
}

abstract class _RelatedQuote implements RelatedQuote {
  const factory _RelatedQuote({
    required final String source,
    required final String quote,
  }) = _$RelatedQuoteImpl;

  factory _RelatedQuote.fromJson(Map<String, dynamic> json) =
      _$RelatedQuoteImpl.fromJson;

  @override
  String get source;
  @override
  String get quote;

  /// Create a copy of RelatedQuote
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RelatedQuoteImplCopyWith<_$RelatedQuoteImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SongEssence _$SongEssenceFromJson(Map<String, dynamic> json) {
  return _SongEssence.fromJson(json);
}

/// @nodoc
mixin _$SongEssence {
  String get songId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get releaseDate => throw _privateConstructorUsedError;
  List<String> get themes => throw _privateConstructorUsedError;
  String get emotion => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  String get interpretation => throw _privateConstructorUsedError;
  LyricsAnalysis get lyricsAnalysis => throw _privateConstructorUsedError;
  List<RelatedQuote>? get relatedQuotes => throw _privateConstructorUsedError;
  Map<String, dynamic>? get connections => throw _privateConstructorUsedError;
  String get confidence => throw _privateConstructorUsedError;

  /// Serializes this SongEssence to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SongEssence
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SongEssenceCopyWith<SongEssence> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SongEssenceCopyWith<$Res> {
  factory $SongEssenceCopyWith(
    SongEssence value,
    $Res Function(SongEssence) then,
  ) = _$SongEssenceCopyWithImpl<$Res, SongEssence>;
  @useResult
  $Res call({
    String songId,
    String title,
    String releaseDate,
    List<String> themes,
    String emotion,
    String message,
    String interpretation,
    LyricsAnalysis lyricsAnalysis,
    List<RelatedQuote>? relatedQuotes,
    Map<String, dynamic>? connections,
    String confidence,
  });

  $LyricsAnalysisCopyWith<$Res> get lyricsAnalysis;
}

/// @nodoc
class _$SongEssenceCopyWithImpl<$Res, $Val extends SongEssence>
    implements $SongEssenceCopyWith<$Res> {
  _$SongEssenceCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SongEssence
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? songId = null,
    Object? title = null,
    Object? releaseDate = null,
    Object? themes = null,
    Object? emotion = null,
    Object? message = null,
    Object? interpretation = null,
    Object? lyricsAnalysis = null,
    Object? relatedQuotes = freezed,
    Object? connections = freezed,
    Object? confidence = null,
  }) {
    return _then(
      _value.copyWith(
            songId: null == songId
                ? _value.songId
                : songId // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            releaseDate: null == releaseDate
                ? _value.releaseDate
                : releaseDate // ignore: cast_nullable_to_non_nullable
                      as String,
            themes: null == themes
                ? _value.themes
                : themes // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            emotion: null == emotion
                ? _value.emotion
                : emotion // ignore: cast_nullable_to_non_nullable
                      as String,
            message: null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String,
            interpretation: null == interpretation
                ? _value.interpretation
                : interpretation // ignore: cast_nullable_to_non_nullable
                      as String,
            lyricsAnalysis: null == lyricsAnalysis
                ? _value.lyricsAnalysis
                : lyricsAnalysis // ignore: cast_nullable_to_non_nullable
                      as LyricsAnalysis,
            relatedQuotes: freezed == relatedQuotes
                ? _value.relatedQuotes
                : relatedQuotes // ignore: cast_nullable_to_non_nullable
                      as List<RelatedQuote>?,
            connections: freezed == connections
                ? _value.connections
                : connections // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            confidence: null == confidence
                ? _value.confidence
                : confidence // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }

  /// Create a copy of SongEssence
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LyricsAnalysisCopyWith<$Res> get lyricsAnalysis {
    return $LyricsAnalysisCopyWith<$Res>(_value.lyricsAnalysis, (value) {
      return _then(_value.copyWith(lyricsAnalysis: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$SongEssenceImplCopyWith<$Res>
    implements $SongEssenceCopyWith<$Res> {
  factory _$$SongEssenceImplCopyWith(
    _$SongEssenceImpl value,
    $Res Function(_$SongEssenceImpl) then,
  ) = __$$SongEssenceImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String songId,
    String title,
    String releaseDate,
    List<String> themes,
    String emotion,
    String message,
    String interpretation,
    LyricsAnalysis lyricsAnalysis,
    List<RelatedQuote>? relatedQuotes,
    Map<String, dynamic>? connections,
    String confidence,
  });

  @override
  $LyricsAnalysisCopyWith<$Res> get lyricsAnalysis;
}

/// @nodoc
class __$$SongEssenceImplCopyWithImpl<$Res>
    extends _$SongEssenceCopyWithImpl<$Res, _$SongEssenceImpl>
    implements _$$SongEssenceImplCopyWith<$Res> {
  __$$SongEssenceImplCopyWithImpl(
    _$SongEssenceImpl _value,
    $Res Function(_$SongEssenceImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SongEssence
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? songId = null,
    Object? title = null,
    Object? releaseDate = null,
    Object? themes = null,
    Object? emotion = null,
    Object? message = null,
    Object? interpretation = null,
    Object? lyricsAnalysis = null,
    Object? relatedQuotes = freezed,
    Object? connections = freezed,
    Object? confidence = null,
  }) {
    return _then(
      _$SongEssenceImpl(
        songId: null == songId
            ? _value.songId
            : songId // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        releaseDate: null == releaseDate
            ? _value.releaseDate
            : releaseDate // ignore: cast_nullable_to_non_nullable
                  as String,
        themes: null == themes
            ? _value._themes
            : themes // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        emotion: null == emotion
            ? _value.emotion
            : emotion // ignore: cast_nullable_to_non_nullable
                  as String,
        message: null == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String,
        interpretation: null == interpretation
            ? _value.interpretation
            : interpretation // ignore: cast_nullable_to_non_nullable
                  as String,
        lyricsAnalysis: null == lyricsAnalysis
            ? _value.lyricsAnalysis
            : lyricsAnalysis // ignore: cast_nullable_to_non_nullable
                  as LyricsAnalysis,
        relatedQuotes: freezed == relatedQuotes
            ? _value._relatedQuotes
            : relatedQuotes // ignore: cast_nullable_to_non_nullable
                  as List<RelatedQuote>?,
        connections: freezed == connections
            ? _value._connections
            : connections // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        confidence: null == confidence
            ? _value.confidence
            : confidence // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SongEssenceImpl implements _SongEssence {
  const _$SongEssenceImpl({
    required this.songId,
    required this.title,
    required this.releaseDate,
    required final List<String> themes,
    required this.emotion,
    required this.message,
    required this.interpretation,
    required this.lyricsAnalysis,
    final List<RelatedQuote>? relatedQuotes,
    final Map<String, dynamic>? connections,
    required this.confidence,
  }) : _themes = themes,
       _relatedQuotes = relatedQuotes,
       _connections = connections;

  factory _$SongEssenceImpl.fromJson(Map<String, dynamic> json) =>
      _$$SongEssenceImplFromJson(json);

  @override
  final String songId;
  @override
  final String title;
  @override
  final String releaseDate;
  final List<String> _themes;
  @override
  List<String> get themes {
    if (_themes is EqualUnmodifiableListView) return _themes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_themes);
  }

  @override
  final String emotion;
  @override
  final String message;
  @override
  final String interpretation;
  @override
  final LyricsAnalysis lyricsAnalysis;
  final List<RelatedQuote>? _relatedQuotes;
  @override
  List<RelatedQuote>? get relatedQuotes {
    final value = _relatedQuotes;
    if (value == null) return null;
    if (_relatedQuotes is EqualUnmodifiableListView) return _relatedQuotes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final Map<String, dynamic>? _connections;
  @override
  Map<String, dynamic>? get connections {
    final value = _connections;
    if (value == null) return null;
    if (_connections is EqualUnmodifiableMapView) return _connections;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final String confidence;

  @override
  String toString() {
    return 'SongEssence(songId: $songId, title: $title, releaseDate: $releaseDate, themes: $themes, emotion: $emotion, message: $message, interpretation: $interpretation, lyricsAnalysis: $lyricsAnalysis, relatedQuotes: $relatedQuotes, connections: $connections, confidence: $confidence)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SongEssenceImpl &&
            (identical(other.songId, songId) || other.songId == songId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.releaseDate, releaseDate) ||
                other.releaseDate == releaseDate) &&
            const DeepCollectionEquality().equals(other._themes, _themes) &&
            (identical(other.emotion, emotion) || other.emotion == emotion) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.interpretation, interpretation) ||
                other.interpretation == interpretation) &&
            (identical(other.lyricsAnalysis, lyricsAnalysis) ||
                other.lyricsAnalysis == lyricsAnalysis) &&
            const DeepCollectionEquality().equals(
              other._relatedQuotes,
              _relatedQuotes,
            ) &&
            const DeepCollectionEquality().equals(
              other._connections,
              _connections,
            ) &&
            (identical(other.confidence, confidence) ||
                other.confidence == confidence));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    songId,
    title,
    releaseDate,
    const DeepCollectionEquality().hash(_themes),
    emotion,
    message,
    interpretation,
    lyricsAnalysis,
    const DeepCollectionEquality().hash(_relatedQuotes),
    const DeepCollectionEquality().hash(_connections),
    confidence,
  );

  /// Create a copy of SongEssence
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SongEssenceImplCopyWith<_$SongEssenceImpl> get copyWith =>
      __$$SongEssenceImplCopyWithImpl<_$SongEssenceImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SongEssenceImplToJson(this);
  }
}

abstract class _SongEssence implements SongEssence {
  const factory _SongEssence({
    required final String songId,
    required final String title,
    required final String releaseDate,
    required final List<String> themes,
    required final String emotion,
    required final String message,
    required final String interpretation,
    required final LyricsAnalysis lyricsAnalysis,
    final List<RelatedQuote>? relatedQuotes,
    final Map<String, dynamic>? connections,
    required final String confidence,
  }) = _$SongEssenceImpl;

  factory _SongEssence.fromJson(Map<String, dynamic> json) =
      _$SongEssenceImpl.fromJson;

  @override
  String get songId;
  @override
  String get title;
  @override
  String get releaseDate;
  @override
  List<String> get themes;
  @override
  String get emotion;
  @override
  String get message;
  @override
  String get interpretation;
  @override
  LyricsAnalysis get lyricsAnalysis;
  @override
  List<RelatedQuote>? get relatedQuotes;
  @override
  Map<String, dynamic>? get connections;
  @override
  String get confidence;

  /// Create a copy of SongEssence
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SongEssenceImplCopyWith<_$SongEssenceImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
