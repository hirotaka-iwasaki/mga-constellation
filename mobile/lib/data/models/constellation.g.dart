// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'constellation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ConstellationImpl _$$ConstellationImplFromJson(Map<String, dynamic> json) =>
    _$ConstellationImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      shortName: json['shortName'] as String?,
      type: $enumDecode(_$ConstellationTypeEnumMap, json['type']),
      year: (json['year'] as num).toInt(),
      date: json['date'] as String?,
      color: json['color'] as String,
      songs: (json['songs'] as List<dynamic>).map((e) => e as String).toList(),
    );

Map<String, dynamic> _$$ConstellationImplToJson(_$ConstellationImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'shortName': instance.shortName,
      'type': _$ConstellationTypeEnumMap[instance.type]!,
      'year': instance.year,
      'date': instance.date,
      'color': instance.color,
      'songs': instance.songs,
    };

const _$ConstellationTypeEnumMap = {
  ConstellationType.album: 'album',
  ConstellationType.live: 'live',
  ConstellationType.theme: 'theme',
};
