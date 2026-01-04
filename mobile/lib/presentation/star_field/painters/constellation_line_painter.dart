import 'package:flutter/material.dart';
import 'package:mga_constellation/data/models/constellation.dart';
import 'package:mga_constellation/data/models/star_position.dart';

class ConstellationLinePainter extends CustomPainter {
  final List<Constellation> constellations;
  final List<StarPosition> positions;
  final Map<String, String> titleToIdMap;
  final double viewX;
  final double viewY;
  final double viewWidth;
  final double viewHeight;
  final double animationProgress;

  ConstellationLinePainter({
    required this.constellations,
    required this.positions,
    required this.titleToIdMap,
    required this.viewX,
    required this.viewY,
    required this.viewWidth,
    required this.viewHeight,
    required this.animationProgress,
  });

  Map<String, StarPosition> get _positionMap {
    return {for (var p in positions) p.id: p};
  }

  @override
  void paint(Canvas canvas, Size size) {
    for (var lineIndex = 0; lineIndex < constellations.length; lineIndex++) {
      final constellation = constellations[lineIndex];
      final color = _parseColor(constellation.color);

      // Get star positions for this constellation
      final starPositions = <StarPosition>[];
      for (final title in constellation.songs) {
        final songId = titleToIdMap[title];
        if (songId != null) {
          final pos = _positionMap[songId];
          if (pos != null) {
            starPositions.add(pos);
          }
        }
      }

      if (starPositions.length < 2) continue;

      // Calculate dots for all segments with cumulative index
      final dots = <({Offset point, int cumulativeIndex})>[];
      var cumulativeIndex = 0;

      for (var i = 0; i < starPositions.length - 1; i++) {
        final p1 = _transformPoint(starPositions[i], size);
        final p2 = _transformPoint(starPositions[i + 1], size);

        final distance = (p2 - p1).distance;
        final zoomFactor = 100 / viewWidth;
        final dotSpacing = 8.0 / zoomFactor.clamp(0.5, 2.0);
        final numDots = (distance / dotSpacing).floor();

        for (var j = 1; j < numDots; j++) {
          final t = j / numDots;
          dots.add((
            point: Offset.lerp(p1, p2, t)!,
            cumulativeIndex: cumulativeIndex++,
          ));
        }
      }

      // Draw dots with staggered animation
      // Calculate max delay to ensure all dots are visible when animation completes
      final totalDots = dots.length;
      final maxDotDelay = totalDots > 0 ? 0.6 : 0.0; // Max 60% of animation for dot delays

      for (final dot in dots) {
        final lineDelay = lineIndex * 0.1; // Reduced from 0.15
        // Scale dot delay based on total dots to fit within animation
        final normalizedIndex = totalDots > 1 ? dot.cumulativeIndex / (totalDots - 1) : 0.0;
        final dotDelay = lineDelay + normalizedIndex * maxDotDelay;
        final dotProgress = ((animationProgress - dotDelay) / 0.3).clamp(0.0, 1.0);

        if (dotProgress > 0) {
          final zoomFactor = 100 / viewWidth;
          final dotRadius = 2.0 / zoomFactor.clamp(0.5, 2.0);

          canvas.drawCircle(
            dot.point,
            dotRadius,
            Paint()..color = color.withValues(alpha: 0.4 * dotProgress),
          );
        }
      }
    }
  }

  Offset _transformPoint(StarPosition pos, Size size) {
    return Offset(
      ((pos.x - viewX) / viewWidth) * size.width,
      ((pos.y - viewY) / viewHeight) * size.height,
    );
  }

  Color _parseColor(String hexColor) {
    final hex = hexColor.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  @override
  bool shouldRepaint(covariant ConstellationLinePainter oldDelegate) {
    return oldDelegate.constellations != constellations ||
        oldDelegate.positions != positions ||
        oldDelegate.viewX != viewX ||
        oldDelegate.viewY != viewY ||
        oldDelegate.viewWidth != viewWidth ||
        oldDelegate.viewHeight != viewHeight ||
        oldDelegate.animationProgress != animationProgress;
  }
}
