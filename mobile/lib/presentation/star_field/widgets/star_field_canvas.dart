import 'package:flutter/material.dart';
import 'package:mga_constellation/core/constants/colors.dart';
import 'package:mga_constellation/core/constants/dimensions.dart';
import 'package:mga_constellation/data/models/models.dart';
import 'package:mga_constellation/data/services/share_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mga_constellation/data/services/api_service.dart';
import 'package:mga_constellation/presentation/star_field/painters/star_painter.dart';
import 'package:mga_constellation/presentation/star_field/painters/constellation_line_painter.dart';
import 'package:mga_constellation/presentation/modals/song_detail_modal.dart';
import 'package:mga_constellation/presentation/modals/search_modal.dart';
import 'package:mga_constellation/presentation/modals/tutorial_overlay.dart';
import 'package:mga_constellation/presentation/modals/custom_constellation_builder.dart';
import 'package:mga_constellation/presentation/star_field/widgets/category_selector.dart';
import 'package:mga_constellation/presentation/star_field/widgets/song_card.dart';

class StarFieldCanvas extends StatefulWidget {
  final List<Song> songs;
  final List<StarPosition> positions;
  final List<Constellation> constellations;
  final List<Constellation> customConstellations;
  final Map<String, SongEssence> essences;
  final Function(Constellation) onSaveCustomConstellation;
  final Function(String) onDeleteCustomConstellation;

  const StarFieldCanvas({
    super.key,
    required this.songs,
    required this.positions,
    required this.constellations,
    this.customConstellations = const [],
    this.essences = const {},
    required this.onSaveCustomConstellation,
    required this.onDeleteCustomConstellation,
  });

  @override
  State<StarFieldCanvas> createState() => _StarFieldCanvasState();
}

class _StarFieldCanvasState extends State<StarFieldCanvas>
    with SingleTickerProviderStateMixin {
  // ViewBox state (like Web version's viewBox)
  double _viewX = 0;
  double _viewY = 0;
  double _viewWidth = 100;
  double _viewHeight = 100;
  bool _viewBoxInitialized = false;

  // Gesture state
  Offset? _lastTouch;
  bool _isPanning = false;

  String? _selectedId;
  final Set<String> _selectedConstellationIds = {};
  bool _isSharing = false;

  late AnimationController _animationController;

  // Maps for quick lookup
  late Map<String, Song> _songMap;
  late Map<String, String> _titleToIdMap;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 5000),
    );
    _buildMaps();
  }

  void _buildMaps() {
    _songMap = {for (var s in widget.songs) s.id: s};
    _titleToIdMap = {for (var s in widget.songs) s.title: s.id};
  }

  void _initializeViewBox(Size screenSize) {
    if (_viewBoxInitialized) return;

    final aspect = screenSize.height / screenSize.width;
    if (aspect > 1) {
      // 縦長画面: 横幅100を基準に、縦を広げる
      _viewHeight = 100 * aspect;
      _viewY = (100 - _viewHeight) / 2; // 星座マップを中央に配置
    }
    _viewBoxInitialized = true;
  }

  void _resetViewBox(Size screenSize) {
    final aspect = screenSize.height / screenSize.width;
    setState(() {
      _viewX = 0;
      _viewWidth = 100;
      if (aspect > 1) {
        _viewHeight = 100 * aspect;
        _viewY = (100 - _viewHeight) / 2;
      } else {
        _viewY = 0;
        _viewHeight = 100;
      }
    });
  }

  @override
  void didUpdateWidget(StarFieldCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.songs != widget.songs ||
        oldWidget.positions != widget.positions) {
      _buildMaps();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Get highlighted song IDs from selected constellations
  Set<String> get _highlightedIds {
    final ids = <String>{};
    for (final cId in _selectedConstellationIds) {
      final constellation =
          widget.constellations.where((c) => c.id == cId).firstOrNull;
      if (constellation != null) {
        for (final title in constellation.songs) {
          final songId = _titleToIdMap[title];
          if (songId != null) ids.add(songId);
        }
      }
    }
    return ids;
  }

  // Get selected constellations
  List<Constellation> get _selectedConstellations {
    return _selectedConstellationIds
        .map((id) => widget.constellations.where((c) => c.id == id).firstOrNull)
        .whereType<Constellation>()
        .toList();
  }

  // Navigation through songs
  List<String> get _navigableSongIds {
    if (_selectedConstellationIds.isNotEmpty) {
      final constellation = widget.constellations
          .where((c) => c.id == _selectedConstellationIds.first)
          .firstOrNull;
      if (constellation != null) {
        return constellation.songs
            .map((title) => _titleToIdMap[title])
            .whereType<String>()
            .toList();
      }
    }
    // Default: sorted by release date
    final sorted = [...widget.songs]
      ..sort((a, b) => a.releaseDate.compareTo(b.releaseDate));
    return sorted.map((s) => s.id).toList();
  }

  int get _selectedIndex {
    if (_selectedId == null) return -1;
    return _navigableSongIds.indexOf(_selectedId!);
  }

  void _goToNextStar() {
    if (_selectedIndex < 0) return;
    final nextIndex = (_selectedIndex + 1) % _navigableSongIds.length;
    setState(() {
      _selectedId = _navigableSongIds[nextIndex];
    });
  }

  void _goToPrevStar() {
    if (_selectedIndex < 0) return;
    final prevIndex =
        (_selectedIndex - 1 + _navigableSongIds.length) % _navigableSongIds.length;
    setState(() {
      _selectedId = _navigableSongIds[prevIndex];
    });
  }

  // Focus on a specific star by centering the view on it
  void _focusOnStar(String songId) {
    final positionMap = {for (var p in widget.positions) p.id: p};
    final pos = positionMap[songId];
    if (pos == null) return;

    setState(() {
      _selectedId = songId;
      // Center the view on this star
      _viewX = pos.x - _viewWidth / 2;
      _viewY = pos.y - _viewHeight / 2;

      // Clamp to bounds
      final minX = -_viewWidth / 2;
      final maxX = 100 - _viewWidth / 2;
      final minY = -_viewHeight / 2;
      final maxY = 100 - _viewHeight / 2;

      _viewX = _viewX.clamp(minX, maxX);
      _viewY = _viewY.clamp(minY, maxY);
    });
  }

  // Open search modal
  void _openSearch() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
        child: SearchModal(
          songs: widget.songs,
          onSelect: (song) {
            _focusOnStar(song.id);
          },
          onOpenBuilder: _openBuilder,
        ),
      ),
    );
  }

  // Open custom constellation builder
  void _openBuilder([Constellation? editingConstellation]) {
    Navigator.of(context).push(
      MaterialPageRoute(
        fullscreenDialog: true,
        builder: (context) => CustomConstellationBuilder(
          songs: widget.songs,
          editingConstellation: editingConstellation,
          onSave: (constellation) {
            widget.onSaveCustomConstellation(constellation);
            // Auto-select the newly created constellation
            setState(() {
              _selectedConstellationIds.add(constellation.id);
              _animationController.forward(from: 0);
              // Select first song
              if (constellation.songs.isNotEmpty) {
                final firstSongId = _titleToIdMap[constellation.songs.first];
                if (firstSongId != null) {
                  _selectedId = firstSongId;
                }
              }
            });
          },
        ),
      ),
    );
  }

  // Open menu modal
  void _openMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
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
              // Menu items
              if (_selectedConstellationIds.isNotEmpty)
                _MenuTile(
                  icon: _isSharing ? Icons.hourglass_empty : Icons.share,
                  label: _isSharing ? '共有中...' : '画像として共有',
                  onTap: _isSharing
                      ? () {}
                      : () {
                          Navigator.pop(context);
                          _shareImage();
                        },
                ),
              _MenuTile(
                icon: Icons.add,
                label: '推し座を作成',
                onTap: () {
                  Navigator.pop(context);
                  _openBuilder();
                },
              ),
              const Divider(color: Color(0xFF334155), height: 1),
              _MenuTile(
                icon: Icons.help_outline,
                label: '使い方',
                onTap: () {
                  Navigator.pop(context);
                  _showTutorial();
                },
              ),
              _MenuTile(
                icon: Icons.map_outlined,
                label: '開発ロードマップ',
                onTap: () {
                  Navigator.pop(context);
                  _showRoadmap();
                },
              ),
              _MenuTile(
                icon: Icons.mail_outline,
                label: '感想を送る',
                onTap: () {
                  Navigator.pop(context);
                  _showFeedback();
                },
              ),
              if (widget.customConstellations.isNotEmpty) ...[
                const Divider(color: Color(0xFF334155), height: 1),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Dimensions.md,
                    vertical: 8,
                  ),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'マイ推し座',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
                ...widget.customConstellations.map((c) => _CustomConstellationTile(
                      constellation: c,
                      onSelect: () {
                        Navigator.pop(context);
                        _toggleConstellation(c.id);
                      },
                      onEdit: () {
                        Navigator.pop(context);
                        _openBuilder(c);
                      },
                      onDelete: () {
                        Navigator.pop(context);
                        _showDeleteConfirmation(c);
                      },
                    )),
              ],
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  // Share constellation image
  Future<void> _shareImage() async {
    if (_isSharing || _selectedConstellationIds.isEmpty) return;

    setState(() => _isSharing = true);

    try {
      final success = await ShareService.shareConstellationImage(
        selectedConstellations: _selectedConstellations,
        positions: widget.positions,
        titleToIdMap: _titleToIdMap,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? '共有しました' : '共有に失敗しました'),
            backgroundColor: success
                ? const Color(0xFF22C55E)
                : const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSharing = false);
      }
    }
  }

  // Show tutorial overlay (same as app launch)
  void _showTutorial() {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.transparent,
        pageBuilder: (context, animation, secondaryAnimation) {
          return TutorialOverlay(
            onComplete: () => Navigator.of(context).pop(),
          );
        },
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  // Show roadmap modal
  void _showRoadmap() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _RoadmapModalContent(
        onOpenFeedback: () {
          Navigator.pop(ctx);
          _showFeedback();
        },
      ),
    );
  }

  // Show feedback modal
  void _showFeedback() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _FeedbackModalContent(
        onClose: () => Navigator.pop(ctx),
      ),
    );
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showDeleteConfirmation(Constellation constellation) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          '推し座を削除',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          '「${constellation.name}」を削除しますか？',
          style: TextStyle(color: Colors.white.withValues(alpha: 0.7)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'キャンセル',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              widget.onDeleteCustomConstellation(constellation.id);
              setState(() {
                _selectedConstellationIds.remove(constellation.id);
              });
            },
            child: const Text(
              '削除',
              style: TextStyle(color: Color(0xFFEF4444)),
            ),
          ),
        ],
      ),
    );
  }

  // Pan handling
  void _handlePan(double deltaX, double deltaY, Size size) {
    final svgDeltaX = (deltaX / size.width) * _viewWidth;
    final svgDeltaY = (deltaY / size.height) * _viewHeight;

    setState(() {
      var newX = _viewX - svgDeltaX;
      var newY = _viewY - svgDeltaY;

      // Clamp to bounds
      final minX = -_viewWidth / 2;
      final maxX = 100 - _viewWidth / 2;
      final minY = -_viewHeight / 2;
      final maxY = 100 - _viewHeight / 2;

      newX = newX.clamp(minX, maxX);
      newY = newY.clamp(minY, maxY);

      _viewX = newX;
      _viewY = newY;
    });
  }

  // Zoom handling
  void _handleZoom(double scale, Offset center, Size size) {
    setState(() {
      final newWidth = (_viewWidth / scale).clamp(20.0, 200.0);
      final newHeight = (_viewHeight / scale).clamp(20.0, 200.0);

      // Maintain zoom center
      final svgCenterX = (center.dx / size.width) * _viewWidth + _viewX;
      final svgCenterY = (center.dy / size.height) * _viewHeight + _viewY;

      final widthRatio = newWidth / _viewWidth;
      final heightRatio = newHeight / _viewHeight;

      var newX = svgCenterX - (svgCenterX - _viewX) * widthRatio;
      var newY = svgCenterY - (svgCenterY - _viewY) * heightRatio;

      // Clamp
      final minX = (100 - newWidth) / 2 < 0 ? (100 - newWidth) / 2 : 0;
      final maxX = 100 - newWidth / 2 > 0 ? 100 - newWidth / 2 : 0;
      final minY = (100 - newHeight) / 2 < 0 ? (100 - newHeight) / 2 : 0;
      final maxY = 100 - newHeight / 2 > 0 ? 100 - newHeight / 2 : 0;

      newX = newX.clamp(minX.toDouble(), maxX.toDouble());
      newY = newY.clamp(minY.toDouble(), maxY.toDouble());

      _viewX = newX;
      _viewY = newY;
      _viewWidth = newWidth;
      _viewHeight = newHeight;
    });
  }

  void _onScaleStart(ScaleStartDetails details) {
    if (details.pointerCount == 1) {
      _lastTouch = details.focalPoint;
      _isPanning = false;
    }
  }

  void _onScaleUpdate(ScaleUpdateDetails details) {
    final size = context.size;
    if (size == null) return;

    if (details.pointerCount == 1 && _lastTouch != null) {
      final delta = details.focalPoint - _lastTouch!;
      if (delta.distance > 5) {
        _isPanning = true;
        _handlePan(delta.dx, delta.dy, size);
        _lastTouch = details.focalPoint;
      }
    } else if (details.pointerCount == 2) {
      _handleZoom(details.scale, details.focalPoint, size);
    }
  }

  void _onScaleEnd(ScaleEndDetails details) {
    _lastTouch = null;
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) setState(() => _isPanning = false);
    });
  }

  DateTime? _lastTapTime;

  void _onDoubleTap() {
    final size = context.size;
    if (size != null) {
      _resetViewBox(size);
    }
  }

  void _onTapUp(TapUpDetails details) {
    if (_isPanning) return;

    // Double tap detection
    final now = DateTime.now();
    if (_lastTapTime != null &&
        now.difference(_lastTapTime!).inMilliseconds < 300) {
      _onDoubleTap();
      _lastTapTime = null;
      return;
    }
    _lastTapTime = now;

    final tappedPosition = _findTappedStar(details.localPosition);
    if (tappedPosition != null) {
      setState(() {
        if (_selectedId == tappedPosition.id) {
          // Same star tapped - show detail modal
          _showSongDetail(tappedPosition.id);
        } else {
          _selectedId = tappedPosition.id;
        }
      });
    } else {
      setState(() {
        _selectedId = null;
      });
    }
  }

  StarPosition? _findTappedStar(Offset localPosition) {
    final size = context.size;
    if (size == null) return null;

    const tapRadius = 25.0;

    for (final pos in widget.positions) {
      final screenPoint = _transformToScreen(pos, size);
      final distance = (screenPoint - localPosition).distance;
      if (distance < tapRadius) {
        return pos;
      }
    }
    return null;
  }

  Offset _transformToScreen(StarPosition pos, Size size) {
    return Offset(
      ((pos.x - _viewX) / _viewWidth) * size.width,
      ((pos.y - _viewY) / _viewHeight) * size.height,
    );
  }

  void _showSongDetail(String songId) {
    final song = _songMap[songId];
    if (song == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SongDetailModal(
        song: song,
        constellations: widget.constellations
            .where((c) => c.songs.contains(song.title))
            .toList(),
        essence: widget.essences[songId],
        currentIndex: _selectedIndex,
        totalCount: _navigableSongIds.length,
        onNext: () {
          _goToNextStar();
          Navigator.pop(context);
          Future.delayed(const Duration(milliseconds: 100), () {
            if (_selectedId != null) _showSongDetail(_selectedId!);
          });
        },
        onPrev: () {
          _goToPrevStar();
          Navigator.pop(context);
          Future.delayed(const Duration(milliseconds: 100), () {
            if (_selectedId != null) _showSongDetail(_selectedId!);
          });
        },
        onSelectConstellation: (constellation) {
          setState(() {
            if (!_selectedConstellationIds.contains(constellation.id)) {
              _selectedConstellationIds.add(constellation.id);
              _animationController.forward(from: 0);
            }
          });
          Navigator.pop(context);
        },
      ),
    );
  }

  void _toggleConstellation(String id) {
    setState(() {
      if (_selectedConstellationIds.contains(id)) {
        _selectedConstellationIds.remove(id);
        if (_selectedConstellationIds.isEmpty) {
          _animationController.reset();
        }
      } else {
        _selectedConstellationIds.add(id);
        _animationController.forward(from: 0);
        // Select first song of constellation
        final constellation =
            widget.constellations.where((c) => c.id == id).firstOrNull;
        if (constellation != null && constellation.songs.isNotEmpty) {
          final firstSongId = _titleToIdMap[constellation.songs.first];
          if (firstSongId != null) {
            _selectedId = firstSongId;
          }
        }
      }
    });
  }

  void _clearConstellationSelection() {
    setState(() {
      _selectedConstellationIds.clear();
      _animationController.reset();
    });
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final topPadding = MediaQuery.of(context).padding.top;
    final screenSize = MediaQuery.of(context).size;
    final hasSelection = _selectedConstellationIds.isNotEmpty;

    // Initialize viewBox based on screen aspect ratio
    _initializeViewBox(screenSize);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Background gradient
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF0F172A), // slate-900
                Color(0xFF1E293B), // slate-800
                Color(0xFF0F172A), // slate-900
              ],
            ),
          ),
        ),

        // Radial glow overlay
        Container(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: Alignment.center,
              radius: 1.0,
              colors: [
                const Color(0xFF312E81).withValues(alpha: 0.2), // indigo-900
                Colors.transparent,
              ],
            ),
          ),
        ),

        // Star field canvas
        Positioned.fill(
          child: GestureDetector(
            onScaleStart: _onScaleStart,
            onScaleUpdate: _onScaleUpdate,
            onScaleEnd: _onScaleEnd,
            onTapUp: _onTapUp,
            child: AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return CustomPaint(
                  painter: StarPainter(
                    positions: widget.positions,
                    highlightedIds: _highlightedIds,
                    selectedId: _selectedId,
                    viewX: _viewX,
                    viewY: _viewY,
                    viewWidth: _viewWidth,
                    viewHeight: _viewHeight,
                    hasSelection: hasSelection,
                  ),
                  foregroundPainter: _selectedConstellationIds.isNotEmpty
                      ? ConstellationLinePainter(
                          constellations: _selectedConstellations,
                          positions: widget.positions,
                          titleToIdMap: _titleToIdMap,
                          viewX: _viewX,
                          viewY: _viewY,
                          viewWidth: _viewWidth,
                          viewHeight: _viewHeight,
                          animationProgress: _animationController.value,
                        )
                      : null,
                  size: Size.infinite,
                );
              },
            ),
          ),
        ),

        // Header
        Positioned(
          top: topPadding + Dimensions.md,
          left: Dimensions.md,
          right: Dimensions.md,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Mrs. GREEN APPLE',
                    style: TextStyle(
                      color: AppColors.textPrimary.withValues(alpha: 0.9),
                      fontSize: 16,
                      fontWeight: FontWeight.w300,
                      letterSpacing: 1.5,
                    ),
                  ),
                  Text(
                    'CONSTELLATION MAP',
                    style: TextStyle(
                      color: const Color(0xFF34D399).withValues(alpha: 0.7),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  _HeaderButton(
                    icon: Icons.search,
                    label: '検索',
                    onTap: _openSearch,
                  ),
                  const SizedBox(width: 8),
                  _HeaderButton(
                    icon: Icons.menu,
                    label: 'メニュー',
                    onTap: _openMenu,
                  ),
                ],
              ),
            ],
          ),
        ),

        // Footer
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A).withValues(alpha: 0.95),
              border: Border(
                top: BorderSide(
                  color: Colors.white.withValues(alpha: 0.1),
                  width: 0.5,
                ),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Song card (when selected)
                if (_selectedId != null && _songMap[_selectedId] != null)
                  SongCard(
                    song: _songMap[_selectedId]!,
                    currentIndex: _selectedIndex,
                    totalCount: _navigableSongIds.length,
                    onPrev: _goToPrevStar,
                    onNext: _goToNextStar,
                    onTap: () => _showSongDetail(_selectedId!),
                  ),

                // Selected constellation tags
                if (_selectedConstellations.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.md,
                      vertical: Dimensions.sm,
                    ),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: _clearConstellationSelection,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF334155),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: const Color(0xFF475569),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.close,
                                  size: 12,
                                  color: Colors.white.withValues(alpha: 0.7),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '解除',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.7),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: _selectedConstellations.map((c) {
                                final color = _parseColor(c.color);
                                return Padding(
                                  padding: const EdgeInsets.only(right: 6),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: color.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: color.withValues(alpha: 0.3),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          c.shortName ?? c.name,
                                          style: TextStyle(
                                            color: color,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        GestureDetector(
                                          onTap: () => _toggleConstellation(c.id),
                                          child: Icon(
                                            Icons.close,
                                            size: 12,
                                            color: color.withValues(alpha: 0.7),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Category selector
                CategorySelector(
                  constellations: widget.constellations,
                  selectedIds: _selectedConstellationIds,
                  onToggle: _toggleConstellation,
                  onCreateNew: _openBuilder,
                ),

                SizedBox(height: bottomPadding),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Color _parseColor(String hexColor) {
    final hex = hexColor.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }
}

class _HeaderButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _HeaderButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 36,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A).withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.1),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: Colors.white.withValues(alpha: 0.7),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: Dimensions.md,
          vertical: 14,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: Colors.white.withValues(alpha: 0.7),
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CustomConstellationTile extends StatelessWidget {
  final Constellation constellation;
  final VoidCallback onSelect;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _CustomConstellationTile({
    required this.constellation,
    required this.onSelect,
    required this.onEdit,
    required this.onDelete,
  });

  Color get _color {
    final hex = constellation.color.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onSelect,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: Dimensions.md,
          vertical: 10,
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
                  ),
                  Text(
                    '${constellation.songs.length}曲',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: onEdit,
              icon: Icon(
                Icons.edit,
                size: 18,
                color: Colors.white.withValues(alpha: 0.5),
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(
                minWidth: 32,
                minHeight: 32,
              ),
            ),
            IconButton(
              onPressed: onDelete,
              icon: Icon(
                Icons.delete_outline,
                size: 18,
                color: Colors.white.withValues(alpha: 0.5),
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(
                minWidth: 32,
                minHeight: 32,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoadmapModalContent extends StatefulWidget {
  final VoidCallback onOpenFeedback;

  const _RoadmapModalContent({
    required this.onOpenFeedback,
  });

  @override
  State<_RoadmapModalContent> createState() => _RoadmapModalContentState();
}

class _RoadmapModalContentState extends State<_RoadmapModalContent> {
  bool _isFeaturesOpen = false;
  Map<String, int> _votes = {};
  Set<String> _votedIds = {};
  String? _votingId;

  static const String _votedIdsKey = 'mga-voted-ideas';
  static const int _voteGoal = 20;

  // 実装済み機能
  static const _implementedFeatures = [
    {
      'title': '星座機能',
      'icon': '🎵',
      'items': [
        {'title': '星座表示', 'desc': 'アルバム/ライブを選んで星座を表示'},
        {'title': '複数選択', 'desc': '複数の星座を同時に表示・比較'},
        {'title': 'アニメーション', 'desc': '星座線が順番に繋がる演出'},
      ],
    },
    {
      'title': '検索・ナビゲーション',
      'icon': '🔍',
      'items': [
        {'title': '曲検索', 'desc': '曲名で検索してジャンプ'},
        {'title': 'カードスワイプ', 'desc': 'スワイプで次/前の曲へ移動'},
      ],
    },
    {
      'title': 'カスタム星座',
      'icon': '✨',
      'items': [
        {'title': 'オリジナル星座', 'desc': '好きな曲を選んで星座を作成'},
        {'title': '名前付け', 'desc': '作った星座に名前を付ける'},
        {'title': '共有', 'desc': '画像として保存・SNSでシェア'},
      ],
    },
    {
      'title': '楽曲情報',
      'icon': '📖',
      'items': [
        {'title': '詳細カード', 'desc': '収録アルバム/ライブ一覧を表示'},
        {'title': '外部リンク', 'desc': 'YouTube/Spotify/Apple Musicへ'},
        {'title': '楽曲考察', 'desc': 'LLMによるテーマ分析を表示'},
      ],
    },
  ];

  // 検討中のアイデア（IDを追加）
  static const _ideas = [
    {
      'title': '探索・発見',
      'icon': '🔭',
      'color': Color(0xFF60A5FA),
      'items': [
        {'id': 'explore-storyline', 'title': 'ストーリーライン分析', 'desc': 'EDEN→NOAH→Atlantis→BABELの物語を通した楽曲変遷'},
        {'id': 'explore-tieup-context', 'title': 'タイアップ作品連携', 'desc': '映画・ドラマ・CMの世界観と楽曲の関係性'},
        {'id': 'explore-lucky-star', 'title': '今日のラッキースター', 'desc': 'ランダムな曲へジャンプして新しい出会いを'},
        {'id': 'explore-quiz', 'title': '星座クイズ', 'desc': '星座線だけでアルバム/ライブを当てるゲーム'},
      ],
    },
    {
      'title': '共有・カスタマイズ',
      'icon': '✨',
      'color': Color(0xFFF472B6),
      'items': [
        {'id': 'share-diagnosis', 'title': '診断・称号機能', 'desc': '選んだ曲傾向から「Pop星雲型」などの称号'},
        {'id': 'share-dynamic-ogp', 'title': '動的OGP画像生成', 'desc': '選択した星座のプレビュー画像を自動生成'},
      ],
    },
    {
      'title': '表示・演出',
      'icon': '🌟',
      'color': Color(0xFFFBBF24),
      'items': [
        {'id': 'display-jacket', 'title': 'ジャケット表示', 'desc': 'アルバムアートを詳細カードに表示'},
        {'id': 'display-mv-thumbnail', 'title': 'MVサムネイル表示', 'desc': '楽曲カードにYouTube公式MVのサムネイル'},
        {'id': 'display-shooting-star', 'title': '流れ星エフェクト', 'desc': '操作がないと流れ星が流れる'},
      ],
    },
    {
      'title': '便利機能',
      'icon': '⚡',
      'color': Color(0xFF34D399),
      'items': [
        {'id': 'utility-spotify', 'title': 'Spotify連携', 'desc': '再生履歴に基づき、よく聴く曲を強調'},
        {'id': 'utility-pwa', 'title': 'PWA対応', 'desc': 'ホーム画面に追加してアプリのように使用'},
      ],
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadVotedIds();
    _fetchVotes();
  }

  Future<void> _loadVotedIds() async {
    final prefs = await SharedPreferences.getInstance();
    final ids = prefs.getStringList(_votedIdsKey) ?? [];
    setState(() => _votedIds = ids.toSet());
  }

  Future<void> _saveVotedId(String ideaId) async {
    final prefs = await SharedPreferences.getInstance();
    _votedIds.add(ideaId);
    await prefs.setStringList(_votedIdsKey, _votedIds.toList());
  }

  Future<void> _fetchVotes() async {
    final votes = await ApiService.getVotes();
    if (mounted) {
      setState(() => _votes = votes);
    }
  }

  Future<void> _vote(String ideaId) async {
    if (_votingId != null || _votedIds.contains(ideaId)) return;

    setState(() => _votingId = ideaId);

    final newCount = await ApiService.vote(ideaId);
    if (newCount != null && mounted) {
      await _saveVotedId(ideaId);
      setState(() {
        _votes[ideaId] = newCount;
        _votingId = null;
      });
    } else if (mounted) {
      setState(() => _votingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
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
          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(Dimensions.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  const Text(
                    'Ideas',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.none,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '検討中のアイデア - 欲しい機能に投票してください',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 14,
                      decoration: TextDecoration.none,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Feedback button
                  GestureDetector(
                    onTap: widget.onOpenFeedback,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(0xFF10B981).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.chat_bubble_outline,
                            size: 16,
                            color: const Color(0xFF34D399),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '「これが欲しい！」を送る',
                            style: TextStyle(
                              color: const Color(0xFF34D399),
                              fontSize: 14,
                              decoration: TextDecoration.none,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Implemented features (collapsible)
                  GestureDetector(
                    onTap: () => setState(() => _isFeaturesOpen = !_isFeaturesOpen),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Text('🌟', style: TextStyle(fontSize: 14, decoration: TextDecoration.none)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'これまでに作ったもの',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.8),
                                fontSize: 14,
                                decoration: TextDecoration.none,
                              ),
                            ),
                          ),
                          Icon(
                            _isFeaturesOpen
                                ? Icons.expand_less
                                : Icons.expand_more,
                            size: 20,
                            color: Colors.white.withValues(alpha: 0.5),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_isFeaturesOpen) ...[
                    const SizedBox(height: 12),
                    ..._implementedFeatures.map((section) => _buildFeatureSection(
                          section['title'] as String,
                          section['icon'] as String,
                          section['items'] as List<Map<String, String>>,
                        )),
                  ],
                  const SizedBox(height: 20),

                  // Ideas by category
                  ..._ideas.map((category) => _buildIdeaCategory(
                        category['title'] as String,
                        category['icon'] as String,
                        category['color'] as Color,
                        category['items'] as List<Map<String, String>>,
                      )),

                  // Footer
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      'このサイトは非公式のファンメイドプロジェクトです。',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                        fontSize: 11,
                        decoration: TextDecoration.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureSection(
      String title, String icon, List<Map<String, String>> items) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 12, decoration: TextDecoration.none)),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.check,
                      size: 12,
                      color: const Color(0xFF34D399),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        '${item['title']} - ${item['desc']}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.7),
                          fontSize: 12,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildIdeaCategory(
      String title, String icon, Color color, List<Map<String, String>> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 14, decoration: TextDecoration.none)),
            const SizedBox(width: 6),
            Text(
              title,
              style: TextStyle(
                color: color,
                fontSize: 14,
                fontWeight: FontWeight.w500,
                decoration: TextDecoration.none,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...items.map((item) {
          final ideaId = item['id']!;
          final isVoted = _votedIds.contains(ideaId);
          final isVoting = _votingId == ideaId;
          final voteCount = _votes[ideaId] ?? 0;
          final progressPercent = (voteCount / _voteGoal).clamp(0.0, 1.0);

          return Container(
            margin: const EdgeInsets.only(bottom: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: Stack(
              children: [
                // Progress bar
                Positioned.fill(
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: progressPercent,
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF34D399).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                // Content
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title']!,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontSize: 14,
                                decoration: TextDecoration.none,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item['desc']!,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 12,
                                decoration: TextDecoration.none,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Vote button
                      GestureDetector(
                        onTap: isVoted || isVoting ? null : () => _vote(ideaId),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          child: isVoting
                              ? SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: const Color(0xFFF472B6),
                                  ),
                                )
                              : Icon(
                                  isVoted ? Icons.favorite : Icons.favorite_border,
                                  size: 20,
                                  color: isVoted
                                      ? const Color(0xFFF472B6)
                                      : Colors.white.withValues(alpha: 0.4),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _FeedbackModalContent extends StatefulWidget {
  final VoidCallback onClose;

  const _FeedbackModalContent({
    required this.onClose,
  });

  @override
  State<_FeedbackModalContent> createState() => _FeedbackModalContentState();
}

class _FeedbackModalContentState extends State<_FeedbackModalContent> {
  static const int _maxContentLength = 1000;

  String? _selectedCategory;
  String _content = '';
  String _submitState = 'idle'; // idle, submitting, success, error

  static const _categories = [
    {'id': 'idea', 'label': '機能リクエスト', 'icon': '💡'},
    {'id': 'bug', 'label': 'バグ報告', 'icon': '🐛'},
    {'id': 'praise', 'label': '感想・応援', 'icon': '✨'},
    {'id': 'other', 'label': 'その他', 'icon': '💬'},
  ];

  bool get _isValid =>
      _selectedCategory != null &&
      _content.trim().isNotEmpty &&
      _content.length <= _maxContentLength;

  Future<void> _submit() async {
    if (!_isValid || _submitState == 'submitting') return;

    setState(() => _submitState = 'submitting');

    final success = await ApiService.submitFeedback(
      message: _content.trim(),
      type: _selectedCategory!,
      platform: 'ios',
    );

    if (mounted) {
      setState(() => _submitState = success ? 'success' : 'error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Dimensions.md),
          child: _buildContent(),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_submitState == 'success') {
      return _buildSuccessView();
    }
    if (_submitState == 'error') {
      return _buildErrorView();
    }
    return _buildFormView();
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 24),
        const Text('✨', style: TextStyle(fontSize: 48, decoration: TextDecoration.none)),
        const SizedBox(height: 16),
        const Text(
          'ありがとうございます！',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            decoration: TextDecoration.none,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'フィードバックを受け付けました。\n今後の改善に活用させていただきます。',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 14,
            decoration: TextDecoration.none,
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: widget.onClose,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('閉じる'),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 24),
        const Text('😢', style: TextStyle(fontSize: 48, decoration: TextDecoration.none)),
        const SizedBox(height: 16),
        const Text(
          '送信できませんでした',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            decoration: TextDecoration.none,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '通信エラーが発生しました。\nしばらく待ってからお試しください。',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 14,
            decoration: TextDecoration.none,
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () => setState(() => _submitState = 'idle'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF334155),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('戻る'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('再送信'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFormView() {
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          const Text(
            '匿名フィードバック',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'ご意見・ご要望をお聞かせください',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 14,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 20),

          // Category selection
          Text(
            'カテゴリ',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 3.5,
            children: _categories.map((cat) {
              final isSelected = _selectedCategory == cat['id'];
              return GestureDetector(
                onTap: () => setState(() => _selectedCategory = cat['id'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF10B981).withValues(alpha: 0.2)
                        : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF10B981)
                          : const Color(0xFF475569),
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(
                        cat['icon'] as String,
                        style: const TextStyle(fontSize: 14, decoration: TextDecoration.none),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          cat['label'] as String,
                          style: TextStyle(
                            color: isSelected
                                ? const Color(0xFF34D399)
                                : Colors.white.withValues(alpha: 0.8),
                            fontSize: 13,
                            decoration: TextDecoration.none,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          // Content input
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '内容',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.8),
                  fontSize: 14,
                  decoration: TextDecoration.none,
                ),
              ),
              Text(
                '${_content.length}/$_maxContentLength',
                style: TextStyle(
                  color: _content.length > _maxContentLength
                      ? const Color(0xFFEF4444)
                      : Colors.white.withValues(alpha: 0.5),
                  fontSize: 12,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            maxLines: 4,
            maxLength: _maxContentLength + 100,
            onChanged: (value) => setState(() => _content = value),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: '詳しく教えてください...',
              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
              counterText: '',
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color: _content.length > _maxContentLength
                      ? const Color(0xFFEF4444)
                      : const Color(0xFF475569),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color: _content.length > _maxContentLength
                      ? const Color(0xFFEF4444)
                      : const Color(0xFF475569),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color: _content.length > _maxContentLength
                      ? const Color(0xFFEF4444)
                      : const Color(0xFF64748B),
                ),
              ),
            ),
          ),
          if (_content.length > _maxContentLength)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                '文字数が上限を超えています',
                style: TextStyle(
                  color: const Color(0xFFEF4444),
                  fontSize: 12,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
          const SizedBox(height: 20),

          // Submit button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isValid && _submitState != 'submitting' ? _submit : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: _isValid
                    ? const Color(0xFF10B981)
                    : const Color(0xFF334155),
                foregroundColor: _isValid ? Colors.white : Colors.white.withValues(alpha: 0.5),
                disabledBackgroundColor: const Color(0xFF334155),
                disabledForegroundColor: Colors.white.withValues(alpha: 0.5),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _submitState == 'submitting'
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('送信する'),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(
              '※ 個人情報は入力しないでください',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 11,
                decoration: TextDecoration.none,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
