import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:mga_constellation/data/models/star_position.dart';

class StarPainter extends CustomPainter {
  final List<StarPosition> positions;
  final Set<String> highlightedIds;
  final String? selectedId;
  final double viewX;
  final double viewY;
  final double viewWidth;
  final double viewHeight;
  final bool hasSelection;

  StarPainter({
    required this.positions,
    required this.highlightedIds,
    this.selectedId,
    required this.viewX,
    required this.viewY,
    required this.viewWidth,
    required this.viewHeight,
    required this.hasSelection,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final pos in positions) {
      final isSelected = pos.id == selectedId;
      final isHighlighted = highlightedIds.contains(pos.id);
      final isDimmed = hasSelection && !isHighlighted;

      // Transform to screen coordinates
      final screenPoint = _transformPoint(pos, size);

      // Calculate star size based on zoom level
      final zoomFactor = 100 / viewWidth;
      final baseSize = isSelected || isHighlighted ? 2.5 : 1.8;
      final starSize = baseSize * zoomFactor.clamp(0.5, 2.0);

      // Opacity based on selection state
      final opacity = isDimmed ? 0.2 : 1.0;

      // Draw white glow
      final glowOpacity = (isSelected || isHighlighted ? 0.7 : 0.4) * opacity;
      final gradient = ui.Gradient.radial(
        screenPoint,
        starSize * 3,
        [
          Colors.white.withValues(alpha: glowOpacity),
          Colors.transparent,
        ],
      );
      canvas.drawCircle(
        screenPoint,
        starSize * 3,
        Paint()..shader = gradient,
      );

      // Draw selected star's green glow
      if (isSelected) {
        final greenGlow = ui.Gradient.radial(
          screenPoint,
          starSize * 2,
          [
            const Color(0xFF22C55E).withValues(alpha: 0.4 * opacity),
            Colors.transparent,
          ],
        );
        canvas.drawCircle(
          screenPoint,
          starSize * 2,
          Paint()..shader = greenGlow,
        );
      }

      // Draw star center
      canvas.drawCircle(
        screenPoint,
        starSize * 0.35,
        Paint()
          ..color = Colors.white.withValues(alpha: 0.9 * opacity)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 0.5),
      );
    }
  }

  Offset _transformPoint(StarPosition pos, Size size) {
    return Offset(
      ((pos.x - viewX) / viewWidth) * size.width,
      ((pos.y - viewY) / viewHeight) * size.height,
    );
  }

  @override
  bool shouldRepaint(covariant StarPainter oldDelegate) {
    return oldDelegate.positions != positions ||
        oldDelegate.highlightedIds != highlightedIds ||
        oldDelegate.selectedId != selectedId ||
        oldDelegate.viewX != viewX ||
        oldDelegate.viewY != viewY ||
        oldDelegate.viewWidth != viewWidth ||
        oldDelegate.viewHeight != viewHeight ||
        oldDelegate.hasSelection != hasSelection;
  }
}
