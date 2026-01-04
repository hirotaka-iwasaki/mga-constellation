import 'package:flutter/material.dart';
import 'package:mga_constellation/core/constants/dimensions.dart';
import 'package:mga_constellation/data/models/song.dart';
import 'package:mga_constellation/data/models/constellation.dart';
import 'package:mga_constellation/data/models/song_essence.dart';
import 'package:url_launcher/url_launcher.dart';

class SongDetailModal extends StatelessWidget {
  final Song song;
  final List<Constellation> constellations;
  final SongEssence? essence;
  final int currentIndex;
  final int totalCount;
  final VoidCallback onNext;
  final VoidCallback onPrev;
  final Function(Constellation) onSelectConstellation;

  const SongDetailModal({
    super.key,
    required this.song,
    required this.constellations,
    this.essence,
    required this.currentIndex,
    required this.totalCount,
    required this.onNext,
    required this.onPrev,
    required this.onSelectConstellation,
  });

  List<Constellation> get _albums =>
      constellations.where((c) => c.type == ConstellationType.album).toList();

  List<Constellation> get _lives =>
      constellations.where((c) => c.type == ConstellationType.live).toList();

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _getConnectionLabel(String key) {
    switch (key) {
      case 'answerTo':
        return '← Answer to:';
      case 'answeredBy':
        return '→ Answered by:';
      case 'themeRelation':
        return '≈ Theme:';
      case 'sameProject':
        return '⊂ Same project:';
      case 'tieUp':
        return '♪ Tie-up:';
      default:
        return '$key:';
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header with navigation
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              children: [
                IconButton(
                  onPressed: onPrev,
                  icon: Icon(
                    Icons.chevron_left,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        song.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${song.releaseDate} · ${currentIndex >= 0 ? currentIndex + 1 : "-"}/$totalCount',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: onNext,
                  icon: Icon(
                    Icons.chevron_right,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),

          const Divider(color: Color(0xFF334155), height: 24),

          // Scrollable content
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left: Dimensions.md,
                right: Dimensions.md,
                bottom: bottomPadding + Dimensions.md,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // AI Analysis section
                  if (essence != null) ...[
                    // Theme tags
                    if (essence!.themes.isNotEmpty ||
                        essence!.emotion.isNotEmpty)
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          ...essence!.themes.map((theme) => Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF6366F1)
                                      .withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: const Color(0xFF6366F1)
                                        .withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Text(
                                  theme,
                                  style: const TextStyle(
                                    color: Color(0xFFA5B4FC),
                                    fontSize: 12,
                                  ),
                                ),
                              )),
                          if (essence!.emotion.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B)
                                    .withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0xFFF59E0B)
                                      .withValues(alpha: 0.3),
                                ),
                              ),
                              child: Text(
                                essence!.emotion,
                                style: const TextStyle(
                                  color: Color(0xFFFCD34D),
                                  fontSize: 12,
                                ),
                              ),
                            ),
                        ],
                      ),

                    const SizedBox(height: 16),

                    // Message
                    if (essence!.message.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.only(left: 12),
                        decoration: const BoxDecoration(
                          border: Border(
                            left: BorderSide(
                              color: Color(0xFF6366F1),
                              width: 2,
                            ),
                          ),
                        ),
                        child: Text(
                          essence!.message,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.9),
                            fontSize: 14,
                            height: 1.5,
                          ),
                        ),
                      ),

                    const SizedBox(height: 16),

                    // Interpretation
                    if (essence!.interpretation.isNotEmpty) ...[
                      _SectionTitle(title: 'Interpretation'),
                      const SizedBox(height: 8),
                      Text(
                        essence!.interpretation,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.7),
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Lyrics Analysis
                    if (essence!.lyricsAnalysis.keywords.isNotEmpty ||
                        essence!.lyricsAnalysis.motifs.isNotEmpty ||
                        essence!.lyricsAnalysis.metaphors.isNotEmpty) ...[
                      // Keywords
                      if (essence!.lyricsAnalysis.keywords.isNotEmpty) ...[
                        _SectionTitle(title: 'Keywords'),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          runSpacing: 4,
                          children: essence!.lyricsAnalysis.keywords
                              .map((kw) => Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF1E293B),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      kw,
                                      style: TextStyle(
                                        color:
                                            Colors.white.withValues(alpha: 0.7),
                                        fontSize: 12,
                                      ),
                                    ),
                                  ))
                              .toList(),
                        ),
                        const SizedBox(height: 12),
                      ],

                      // Motifs
                      if (essence!.lyricsAnalysis.motifs.isNotEmpty) ...[
                        _SectionTitle(title: 'Motifs'),
                        const SizedBox(height: 8),
                        ...essence!.lyricsAnalysis.motifs.map((motif) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '•',
                                    style: TextStyle(
                                      color: const Color(0xFF6366F1),
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      motif,
                                      style: TextStyle(
                                        color:
                                            Colors.white.withValues(alpha: 0.7),
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                        const SizedBox(height: 12),
                      ],

                      // Metaphors
                      if (essence!.lyricsAnalysis.metaphors.isNotEmpty) ...[
                        _SectionTitle(title: 'Metaphors'),
                        const SizedBox(height: 8),
                        ...essence!.lyricsAnalysis.metaphors
                            .map((meta) => Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '◇',
                                        style: TextStyle(
                                          color: const Color(0xFFF59E0B),
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          meta,
                                          style: TextStyle(
                                            color: Colors.white
                                                .withValues(alpha: 0.7),
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                        const SizedBox(height: 16),
                      ],
                    ],

                    // Artist comments
                    if (essence!.relatedQuotes != null &&
                        essence!.relatedQuotes!.isNotEmpty) ...[
                      _SectionTitle(title: 'Artist Comments'),
                      const SizedBox(height: 8),
                      ...essence!.relatedQuotes!.map((q) => Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B)
                                  .withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '"${q.quote}"',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.8),
                                    fontSize: 13,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '— ${q.source}',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.5),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          )),
                      const SizedBox(height: 8),
                    ],

                    // Connections
                    if (essence!.connections != null &&
                        essence!.connections!.isNotEmpty) ...[
                      _SectionTitle(title: 'Connections'),
                      const SizedBox(height: 8),
                      ...essence!.connections!.entries.map((entry) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _getConnectionLabel(entry.key),
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.5),
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    entry.value is List
                                        ? (entry.value as List).join(', ')
                                        : entry.value.toString(),
                                    style: TextStyle(
                                      color:
                                          Colors.white.withValues(alpha: 0.7),
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )),
                      const SizedBox(height: 16),
                    ],

                    // Disclaimer
                    Center(
                      child: Text(
                        '※ 楽曲についての解釈は当サイト独自のものであり、アーティストの公式見解ではありません',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.3),
                          fontSize: 10,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),

                    const SizedBox(height: 24),
                  ],

                  // Listen section
                  _SectionTitle(title: 'Listen'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _LinkButton(
                          label: 'YouTube',
                          icon: Icons.play_circle_fill,
                          color: const Color(0xFFDC2626),
                          onTap: () => _openUrl(
                            'https://www.youtube.com/results?search_query=${Uri.encodeComponent("${song.title} Mrs. GREEN APPLE")}',
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _LinkButton(
                          label: 'Spotify',
                          icon: Icons.music_note,
                          color: const Color(0xFF1DB954),
                          onTap: () => _openUrl(
                            'https://open.spotify.com/search/${Uri.encodeComponent("${song.title} Mrs. GREEN APPLE")}',
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _LinkButton(
                          label: 'Apple',
                          icon: Icons.apple,
                          color: const Color(0xFFFC3C44),
                          onTap: () => _openUrl(
                            'https://music.apple.com/jp/search?term=${Uri.encodeComponent("${song.title} Mrs. GREEN APPLE")}',
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Albums section
                  if (_albums.isNotEmpty) ...[
                    _SectionTitle(title: 'Albums'),
                    const SizedBox(height: 12),
                    ..._albums.map((c) => _ConstellationTile(
                          constellation: c,
                          onTap: () => onSelectConstellation(c),
                        )),
                    const SizedBox(height: 16),
                  ],

                  // Lives section
                  if (_lives.isNotEmpty) ...[
                    _SectionTitle(title: 'Lives'),
                    const SizedBox(height: 12),
                    ..._lives.map((c) => _ConstellationTile(
                          constellation: c,
                          onTap: () => onSelectConstellation(c),
                        )),
                    const SizedBox(height: 16),
                  ],

                  // No constellations message
                  if (_albums.isEmpty && _lives.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        child: Text(
                          '収録情報はありません',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),

                  // Close button
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white.withValues(alpha: 0.8),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        '閉じる',
                        style: TextStyle(fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        color: Colors.white.withValues(alpha: 0.5),
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.2,
      ),
    );
  }
}

class _LinkButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _LinkButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ConstellationTile extends StatelessWidget {
  final Constellation constellation;
  final VoidCallback onTap;

  const _ConstellationTile({
    required this.constellation,
    required this.onTap,
  });

  Color get _color {
    final hex = constellation.color.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B).withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: _color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    constellation.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '${constellation.year}',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.white.withValues(alpha: 0.4),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
