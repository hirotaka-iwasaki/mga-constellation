import 'package:flutter/material.dart';
import 'package:mga_constellation/core/constants/dimensions.dart';
import 'package:mga_constellation/data/models/song.dart';

class SongCard extends StatelessWidget {
  final Song song;
  final int currentIndex;
  final int totalCount;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final VoidCallback onTap;

  const SongCard({
    super.key,
    required this.song,
    required this.currentIndex,
    required this.totalCount,
    required this.onPrev,
    required this.onNext,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(Dimensions.md),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF334155),
        ),
      ),
      child: Row(
        children: [
          // Prev button
          GestureDetector(
            onTap: onPrev,
            child: Container(
              padding: const EdgeInsets.all(6),
              child: Icon(
                Icons.chevron_left,
                size: 20,
                color: Colors.white.withValues(alpha: 0.6),
              ),
            ),
          ),

          // Song info
          Expanded(
            child: GestureDetector(
              onTap: onTap,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    song.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${song.releaseDate} · ${currentIndex >= 0 ? currentIndex + 1 : "-"}/$totalCount',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF065F46).withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFF059669).withValues(alpha: 0.5),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'AI分析を見る',
                          style: TextStyle(
                            color: const Color(0xFF6EE7B7),
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 2),
                        Icon(
                          Icons.chevron_right,
                          size: 14,
                          color: const Color(0xFF6EE7B7),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Next button
          GestureDetector(
            onTap: onNext,
            child: Container(
              padding: const EdgeInsets.all(6),
              child: Icon(
                Icons.chevron_right,
                size: 20,
                color: Colors.white.withValues(alpha: 0.6),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
