import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:mga_constellation/data/models/constellation.dart';
import 'package:mga_constellation/data/models/star_position.dart';

class ShareService {
  /// Generate and share an image of the selected constellations
  static Future<bool> shareConstellationImage({
    required List<Constellation> selectedConstellations,
    required List<StarPosition> positions,
    required Map<String, String> titleToIdMap,
  }) async {
    if (selectedConstellations.isEmpty) return false;

    try {
      // Generate the image
      final imageData = await _generateImage(
        selectedConstellations: selectedConstellations,
        positions: positions,
        titleToIdMap: titleToIdMap,
      );

      if (imageData == null) return false;

      // Save to temp file
      final tempDir = await getTemporaryDirectory();
      final file = File('${tempDir.path}/mga-constellation.png');
      await file.writeAsBytes(imageData);

      // Share the file
      final result = await Share.shareXFiles(
        [XFile(file.path)],
        text: '${selectedConstellations.map((c) => c.name).join('、')}の星座 #ミセス推し座',
      );

      return result.status == ShareResultStatus.success;
    } catch (e) {
      debugPrint('Share failed: $e');
      return false;
    }
  }

  static Future<List<int>?> _generateImage({
    required List<Constellation> selectedConstellations,
    required List<StarPosition> positions,
    required Map<String, String> titleToIdMap,
  }) async {
    const size = 1200.0;
    const padding = 80.0;

    // Create position map
    final positionMap = {for (var p in positions) p.id: p};

    // Collect all points from selected constellations
    final allPoints = <({double x, double y, String songId})>[];
    for (final constellation in selectedConstellations) {
      for (final title in constellation.songs) {
        final songId = titleToIdMap[title];
        if (songId != null) {
          final pos = positionMap[songId];
          if (pos != null) {
            allPoints.add((x: pos.x, y: pos.y, songId: songId));
          }
        }
      }
    }

    if (allPoints.isEmpty) return null;

    // Calculate bounding box
    var minX = double.infinity;
    var minY = double.infinity;
    var maxX = double.negativeInfinity;
    var maxY = double.negativeInfinity;

    for (final p in allPoints) {
      minX = minX < p.x ? minX : p.x;
      minY = minY < p.y ? minY : p.y;
      maxX = maxX > p.x ? maxX : p.x;
      maxY = maxY > p.y ? maxY : p.y;
    }

    // Make it square
    final width = maxX - minX;
    final height = maxY - minY;
    final boxSize = (width > height ? width : height).clamp(10.0, 100.0);
    final centerX = (minX + maxX) / 2;
    final centerY = (minY + maxY) / 2;

    // View size with margin
    final viewSize = boxSize * 1.3;
    final viewMinX = centerX - viewSize / 2;
    final viewMinY = centerY - viewSize / 2;

    // Transform function
    Offset transform(double x, double y) {
      return Offset(
        padding + ((x - viewMinX) / viewSize) * (size - padding * 2),
        padding + ((y - viewMinY) / viewSize) * (size - padding * 2),
      );
    }

    // Create picture recorder
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);

    // Draw background gradient
    final bgPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF0F172A),
          Color(0xFF1E293B),
          Color(0xFF0F172A),
        ],
      ).createShader(const Rect.fromLTWH(0, 0, size, size));
    canvas.drawRect(const Rect.fromLTWH(0, 0, size, size), bgPaint);

    // Get highlighted star IDs
    final highlightedStarIds = <String>{};
    for (final constellation in selectedConstellations) {
      for (final title in constellation.songs) {
        final songId = titleToIdMap[title];
        if (songId != null) highlightedStarIds.add(songId);
      }
    }

    // Draw constellation lines
    for (final constellation in selectedConstellations) {
      final points = <Offset>[];
      for (final title in constellation.songs) {
        final songId = titleToIdMap[title];
        if (songId != null) {
          final pos = positionMap[songId];
          if (pos != null) {
            points.add(transform(pos.x, pos.y));
          }
        }
      }

      if (points.length < 2) continue;

      // Draw dotted lines
      final color = _parseColor(constellation.color);
      const dotRadius = 3.0;
      const dotSpacing = 12.0;

      for (var i = 0; i < points.length - 1; i++) {
        final p1 = points[i];
        final p2 = points[i + 1];
        final dist = (p2 - p1).distance;
        final numDots = (dist / dotSpacing).floor();

        for (var j = 1; j < numDots; j++) {
          final t = j / numDots;
          final x = p1.dx + (p2.dx - p1.dx) * t;
          final y = p1.dy + (p2.dy - p1.dy) * t;

          canvas.drawCircle(
            Offset(x, y),
            dotRadius,
            Paint()..color = color.withValues(alpha: 0.5),
          );
        }
      }
    }

    // Draw all stars
    for (final pos in positions) {
      final point = transform(pos.x, pos.y);
      final isHighlighted = highlightedStarIds.contains(pos.id);

      if (isHighlighted) {
        // Highlighted star: bright glow
        final glowGradient = ui.Gradient.radial(
          point,
          20,
          [
            Colors.white.withValues(alpha: 0.8),
            Colors.white.withValues(alpha: 0.3),
            Colors.transparent,
          ],
          [0.0, 0.3, 1.0],
        );
        canvas.drawCircle(
          point,
          20,
          Paint()..shader = glowGradient,
        );
        canvas.drawCircle(
          point,
          6,
          Paint()..color = Colors.white,
        );
      } else {
        // Dim star
        final glowGradient = ui.Gradient.radial(
          point,
          12,
          [
            Colors.white.withValues(alpha: 0.3),
            Colors.white.withValues(alpha: 0.1),
            Colors.transparent,
          ],
          [0.0, 0.3, 1.0],
        );
        canvas.drawCircle(
          point,
          12,
          Paint()..shader = glowGradient,
        );
        canvas.drawCircle(
          point,
          3,
          Paint()..color = Colors.white.withValues(alpha: 0.2),
        );
      }
    }

    // Draw constellation name tags
    var tagX = 40.0;
    const tagY = size - 60.0;

    for (final c in selectedConstellations) {
      final color = _parseColor(c.color);
      final text = c.name;

      // Measure text
      final textPainter = TextPainter(
        text: TextSpan(
          text: text,
          style: TextStyle(
            color: color,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();

      const tagPadding = 16.0;
      final tagWidth = textPainter.width + tagPadding * 2;
      const tagHeight = 44.0;

      // Tag background
      final tagRect = RRect.fromRectAndRadius(
        Rect.fromLTWH(tagX, tagY - tagHeight + 10, tagWidth, tagHeight),
        const Radius.circular(22),
      );
      canvas.drawRRect(
        tagRect,
        Paint()..color = color.withValues(alpha: 0.35),
      );

      // Tag border
      canvas.drawRRect(
        tagRect,
        Paint()
          ..color = color.withValues(alpha: 0.5)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2,
      );

      // Tag text
      textPainter.paint(canvas, Offset(tagX + tagPadding, tagY - tagHeight + 18));

      tagX += tagWidth + 12;
    }

    // Draw watermark
    final watermarkPainter = TextPainter(
      text: TextSpan(
        text: '#ミセス推し座',
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.3),
          fontSize: 20,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    watermarkPainter.layout();
    watermarkPainter.paint(
      canvas,
      Offset(size - watermarkPainter.width - 24, size - 40),
    );

    // Convert to image
    final picture = recorder.endRecording();
    final image = await picture.toImage(size.toInt(), size.toInt());
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);

    return byteData?.buffer.asUint8List();
  }

  static Color _parseColor(String hexColor) {
    final hex = hexColor.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }
}
