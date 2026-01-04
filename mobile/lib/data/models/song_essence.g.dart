// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'song_essence.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LyricsAnalysisImpl _$$LyricsAnalysisImplFromJson(Map<String, dynamic> json) =>
    _$LyricsAnalysisImpl(
      keywords: (json['keywords'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      motifs: (json['motifs'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      metaphors: (json['metaphors'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$$LyricsAnalysisImplToJson(
  _$LyricsAnalysisImpl instance,
) => <String, dynamic>{
  'keywords': instance.keywords,
  'motifs': instance.motifs,
  'metaphors': instance.metaphors,
};

_$RelatedQuoteImpl _$$RelatedQuoteImplFromJson(Map<String, dynamic> json) =>
    _$RelatedQuoteImpl(
      source: json['source'] as String,
      quote: json['quote'] as String,
    );

Map<String, dynamic> _$$RelatedQuoteImplToJson(_$RelatedQuoteImpl instance) =>
    <String, dynamic>{'source': instance.source, 'quote': instance.quote};

_$SongEssenceImpl _$$SongEssenceImplFromJson(Map<String, dynamic> json) =>
    _$SongEssenceImpl(
      songId: json['songId'] as String,
      title: json['title'] as String,
      releaseDate: json['releaseDate'] as String,
      themes: (json['themes'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      emotion: json['emotion'] as String,
      message: json['message'] as String,
      interpretation: json['interpretation'] as String,
      lyricsAnalysis: LyricsAnalysis.fromJson(
        json['lyricsAnalysis'] as Map<String, dynamic>,
      ),
      relatedQuotes: (json['relatedQuotes'] as List<dynamic>?)
          ?.map((e) => RelatedQuote.fromJson(e as Map<String, dynamic>))
          .toList(),
      connections: json['connections'] as Map<String, dynamic>?,
      confidence: json['confidence'] as String,
    );

Map<String, dynamic> _$$SongEssenceImplToJson(_$SongEssenceImpl instance) =>
    <String, dynamic>{
      'songId': instance.songId,
      'title': instance.title,
      'releaseDate': instance.releaseDate,
      'themes': instance.themes,
      'emotion': instance.emotion,
      'message': instance.message,
      'interpretation': instance.interpretation,
      'lyricsAnalysis': instance.lyricsAnalysis,
      'relatedQuotes': instance.relatedQuotes,
      'connections': instance.connections,
      'confidence': instance.confidence,
    };
