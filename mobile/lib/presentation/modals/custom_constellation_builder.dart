import 'package:flutter/material.dart';
import 'package:mga_constellation/core/constants/dimensions.dart';
import 'package:mga_constellation/data/models/song.dart';
import 'package:mga_constellation/data/models/constellation.dart';

const List<String> _colorPresets = [
  // Row 1: 暖色系
  '#FF6B6B', // レッド
  '#FF8C42', // オレンジ
  '#FFD93D', // イエロー
  '#FFB6C1', // ライトピンク
  '#FF6B9D', // ピンク
  '#FF69B4', // ホットピンク
  // Row 2: 寒色系
  '#9D6BFF', // パープル
  '#A855F7', // バイオレット
  '#6B9DFF', // ブルー
  '#38BDF8', // スカイブルー
  '#6BFFB8', // ミント
  '#4ADE80', // グリーン
];

class CustomConstellationBuilder extends StatefulWidget {
  final List<Song> songs;
  final Constellation? editingConstellation;
  final Function(Constellation constellation) onSave;

  const CustomConstellationBuilder({
    super.key,
    required this.songs,
    this.editingConstellation,
    required this.onSave,
  });

  @override
  State<CustomConstellationBuilder> createState() =>
      _CustomConstellationBuilderState();
}

class _CustomConstellationBuilderState
    extends State<CustomConstellationBuilder> {
  late TextEditingController _nameController;
  late TextEditingController _searchController;
  final FocusNode _searchFocusNode = FocusNode();

  String _searchQuery = '';
  List<String> _selectedSongIds = [];
  String _selectedColor = _colorPresets[0];

  late Map<String, Song> _songMap;
  late Map<String, String> _titleToIdMap;

  bool get _isEditMode => widget.editingConstellation != null;

  @override
  void initState() {
    super.initState();
    _buildMaps();

    _nameController = TextEditingController(
      text: widget.editingConstellation?.name ?? '',
    );
    _searchController = TextEditingController();

    if (widget.editingConstellation != null) {
      _selectedColor = widget.editingConstellation!.color;
      _selectedSongIds = widget.editingConstellation!.songs
          .map((title) => _titleToIdMap[title])
          .whereType<String>()
          .toList();
    }

    // Auto focus search field for new constellation
    if (!_isEditMode) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted) _searchFocusNode.requestFocus();
      });
    }
  }

  void _buildMaps() {
    _songMap = {for (var s in widget.songs) s.id: s};
    _titleToIdMap = {for (var s in widget.songs) s.title: s.id};
  }

  @override
  void dispose() {
    _nameController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  List<Song> get _sortedSongs {
    return [...widget.songs]
      ..sort((a, b) => b.releaseDate.compareTo(a.releaseDate));
  }

  List<Song> get _filteredSongs {
    if (_searchQuery.trim().isEmpty) return _sortedSongs;

    final query = _searchQuery.toLowerCase();
    final queryNoSpace = query.replaceAll(RegExp(r'\s+'), '');

    return _sortedSongs.where((song) {
      final title = song.title.toLowerCase();
      final titleNoSpace = title.replaceAll(RegExp(r'\s+'), '');
      return title.contains(query) || titleNoSpace.contains(queryNoSpace);
    }).toList();
  }

  void _toggleSong(String songId) {
    setState(() {
      if (_selectedSongIds.contains(songId)) {
        _selectedSongIds.remove(songId);
      } else {
        _selectedSongIds.add(songId);
      }
    });
  }

  void _removeSong(String songId) {
    setState(() {
      _selectedSongIds.remove(songId);
    });
  }

  void _clearAll() {
    setState(() {
      _selectedSongIds.clear();
    });
  }

  void _reorderSongs(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) {
        newIndex -= 1;
      }
      final item = _selectedSongIds.removeAt(oldIndex);
      _selectedSongIds.insert(newIndex, item);
    });
  }

  bool get _canSave =>
      _selectedSongIds.length >= 2 && _nameController.text.trim().isNotEmpty;

  void _handleSave() {
    if (!_canSave) return;

    final songTitles = _selectedSongIds
        .map((id) => _songMap[id]?.title)
        .whereType<String>()
        .toList();

    final constellation = Constellation(
      id: widget.editingConstellation?.id ?? 'custom-${DateTime.now().millisecondsSinceEpoch}',
      name: _nameController.text.trim(),
      type: ConstellationType.theme,
      year: widget.editingConstellation?.year ?? DateTime.now().year,
      color: _selectedColor,
      songs: songTitles,
    );

    widget.onSave(constellation);
    Navigator.pop(context);
  }

  Color _parseColor(String hexColor) {
    final hex = hexColor.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      color: const Color(0xFF020617),
      child: Column(
        children: [
          // Safe area padding
          SizedBox(height: topPadding),

          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(
                bottom: BorderSide(color: Color(0xFF334155)),
              ),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(
                    Icons.close,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
                Expanded(
                  child: Text(
                    _isEditMode ? '推し座を編集' : '推し座を作成',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                TextButton(
                  onPressed: _canSave ? _handleSave : null,
                  child: Text(
                    _isEditMode ? '更新' : '作成',
                    style: TextStyle(
                      color: _canSave
                          ? Colors.white
                          : Colors.white.withValues(alpha: 0.3),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Selected songs section
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(
                bottom: BorderSide(color: Color(0xFF334155)),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Dimensions.md,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            '選択中 (${_selectedSongIds.length}曲)',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.5),
                              fontSize: 13,
                            ),
                          ),
                          if (_selectedSongIds.length < 2) ...[
                            const SizedBox(width: 8),
                            Text(
                              '※2曲以上選んでください',
                              style: TextStyle(
                                color: const Color(0xFF34D399).withValues(alpha: 0.8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (_selectedSongIds.isNotEmpty)
                        GestureDetector(
                          onTap: _clearAll,
                          child: Text(
                            'クリア',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.4),
                              fontSize: 12,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                if (_selectedSongIds.isNotEmpty)
                  SizedBox(
                    height: _selectedSongIds.length > 3 ? 176 : null,
                    child: ReorderableListView.builder(
                      shrinkWrap: _selectedSongIds.length <= 3,
                      padding: const EdgeInsets.symmetric(
                        horizontal: Dimensions.md,
                      ).copyWith(bottom: 12),
                      itemCount: _selectedSongIds.length,
                      onReorder: _reorderSongs,
                      proxyDecorator: (child, index, animation) {
                        return Material(
                          color: Colors.transparent,
                          child: child,
                        );
                      },
                      itemBuilder: (context, index) {
                        final songId = _selectedSongIds[index];
                        final song = _songMap[songId];
                        if (song == null) {
                          return const SizedBox.shrink(key: ValueKey('empty'));
                        }
                        return _SelectedSongItem(
                          key: ValueKey(songId),
                          song: song,
                          index: index,
                          onRemove: () => _removeSong(songId),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // Search input
          Container(
            padding: const EdgeInsets.all(Dimensions.md),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF334155)),
              ),
            ),
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF475569)),
              ),
              child: Row(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Icon(
                      Icons.search,
                      size: 20,
                      color: Colors.white.withValues(alpha: 0.5),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      focusNode: _searchFocusNode,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                      ),
                      decoration: InputDecoration(
                        hintText: '曲名で検索...',
                        hintStyle: TextStyle(
                          color: Colors.white.withValues(alpha: 0.4),
                          fontSize: 15,
                        ),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value;
                        });
                      },
                    ),
                  ),
                  if (_searchQuery.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        _searchController.clear();
                        setState(() {
                          _searchQuery = '';
                        });
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Icon(
                          Icons.close,
                          size: 20,
                          color: Colors.white.withValues(alpha: 0.5),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Song list
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Dimensions.md,
                    vertical: 8,
                  ),
                  child: Text(
                    'すべての曲 (${_filteredSongs.length}曲)',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 12,
                    ),
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.md,
                    ),
                    itemCount: _filteredSongs.length,
                    itemBuilder: (context, index) {
                      final song = _filteredSongs[index];
                      final isSelected = _selectedSongIds.contains(song.id);
                      return _SongListItem(
                        song: song,
                        isSelected: isSelected,
                        onTap: () => _toggleSong(song.id),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Name and color settings
          Container(
            padding: EdgeInsets.only(
              left: Dimensions.md,
              right: Dimensions.md,
              top: Dimensions.md,
              bottom: bottomPadding + Dimensions.md,
            ),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(
                top: BorderSide(color: Color(0xFF334155)),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name input
                Text(
                  '星座の名前',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF475569)),
                  ),
                  child: TextField(
                    controller: _nameController,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                    ),
                    decoration: InputDecoration(
                      hintText: '例: 夏ソング座',
                      hintStyle: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                        fontSize: 15,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                    maxLength: 20,
                    buildCounter: (context, {required currentLength, required isFocused, maxLength}) => null,
                    onChanged: (_) => setState(() {}),
                  ),
                ),

                const SizedBox(height: 16),

                // Color selection
                Text(
                  '星座線の色',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 40,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _colorPresets.length,
                    itemBuilder: (context, index) {
                      final colorHex = _colorPresets[index];
                      final color = _parseColor(colorHex);
                      final isSelected = _selectedColor == colorHex;
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedColor = colorHex;
                            });
                          },
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                              border: isSelected
                                  ? Border.all(color: Colors.white, width: 3)
                                  : null,
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: color.withValues(alpha: 0.5),
                                        blurRadius: 8,
                                        spreadRadius: 2,
                                      ),
                                    ]
                                  : null,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SelectedSongItem extends StatelessWidget {
  final Song song;
  final int index;
  final VoidCallback onRemove;

  const _SelectedSongItem({
    super.key,
    required this.song,
    required this.index,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          // Drag handle
          ReorderableDragStartListener(
            index: index,
            child: Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Icon(
                Icons.drag_handle,
                size: 20,
                color: Colors.white.withValues(alpha: 0.4),
              ),
            ),
          ),
          // Index number
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: const Color(0xFF334155),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Center(
              child: Text(
                '${index + 1}',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontSize: 11,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Song title
          Expanded(
            child: Text(
              song.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // Remove button
          GestureDetector(
            onTap: onRemove,
            child: Padding(
              padding: const EdgeInsets.only(left: 8),
              child: Icon(
                Icons.close,
                size: 18,
                color: Colors.white.withValues(alpha: 0.4),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SongListItem extends StatelessWidget {
  final Song song;
  final bool isSelected;
  final VoidCallback onTap;

  const _SongListItem({
    required this.song,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        margin: const EdgeInsets.only(bottom: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.white.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            // Checkbox
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: isSelected ? Colors.white : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? Colors.white
                      : Colors.white.withValues(alpha: 0.4),
                  width: 2,
                ),
              ),
              child: isSelected
                  ? const Icon(
                      Icons.check,
                      size: 14,
                      color: Color(0xFF0F172A),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            // Song info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    song.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${song.year}',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
