import 'package:freezed_annotation/freezed_annotation.dart';

part 'song_essence.freezed.dart';
part 'song_essence.g.dart';

@freezed
class LyricsAnalysis with _$LyricsAnalysis {
  const factory LyricsAnalysis({
    required List<String> keywords,
    required List<String> motifs,
    required List<String> metaphors,
  }) = _LyricsAnalysis;

  factory LyricsAnalysis.fromJson(Map<String, dynamic> json) =>
      _$LyricsAnalysisFromJson(json);
}

@freezed
class RelatedQuote with _$RelatedQuote {
  const factory RelatedQuote({
    required String source,
    required String quote,
  }) = _RelatedQuote;

  factory RelatedQuote.fromJson(Map<String, dynamic> json) =>
      _$RelatedQuoteFromJson(json);
}

@freezed
class SongEssence with _$SongEssence {
  const factory SongEssence({
    required String songId,
    required String title,
    required String releaseDate,
    required List<String> themes,
    required String emotion,
    required String message,
    required String interpretation,
    required LyricsAnalysis lyricsAnalysis,
    List<RelatedQuote>? relatedQuotes,
    Map<String, dynamic>? connections,
    required String confidence,
  }) = _SongEssence;

  factory SongEssence.fromJson(Map<String, dynamic> json) =>
      _$SongEssenceFromJson(json);
}
