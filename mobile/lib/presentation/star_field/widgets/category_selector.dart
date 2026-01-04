import 'package:flutter/material.dart';
import 'package:mga_constellation/core/constants/dimensions.dart';
import 'package:mga_constellation/data/models/constellation.dart';

class CategorySelector extends StatefulWidget {
  final List<Constellation> constellations;
  final Set<String> selectedIds;
  final Function(String) onToggle;
  final VoidCallback? onCreateNew;

  const CategorySelector({
    super.key,
    required this.constellations,
    required this.selectedIds,
    required this.onToggle,
    this.onCreateNew,
  });

  @override
  State<CategorySelector> createState() => _CategorySelectorState();
}

class _CategorySelectorState extends State<CategorySelector> {
  String? _openCategory; // 'album', 'live', 'custom', or null

  List<Constellation> _getConstellationsForCategory(String category) {
    switch (category) {
      case 'album':
        return widget.constellations
            .where((c) => c.type == ConstellationType.album)
            .toList()
          ..sort((a, b) => b.year.compareTo(a.year));
      case 'live':
        return widget.constellations
            .where((c) => c.type == ConstellationType.live)
            .toList()
          ..sort((a, b) => b.year.compareTo(a.year));
      case 'custom':
        return widget.constellations
            .where((c) => c.type == ConstellationType.theme)
            .toList()
          ..sort((a, b) => b.year.compareTo(a.year));
      default:
        return [];
    }
  }

  void _toggleCategory(String category) {
    setState(() {
      _openCategory = _openCategory == category ? null : category;
    });
  }

  void _selectConstellation(String id) {
    widget.onToggle(id);
    setState(() {
      _openCategory = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Dropdown menu (shown above buttons when open)
        if (_openCategory != null)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: Dimensions.md),
            constraints: const BoxConstraints(maxHeight: 300),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF475569)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Add "新規作成" button for custom category
                  if (_openCategory == 'custom' && widget.onCreateNew != null)
                    GestureDetector(
                      onTap: () {
                        setState(() => _openCategory = null);
                        widget.onCreateNew!();
                      },
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: const BoxDecoration(
                          color: Color(0xFF6366F1),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.add,
                              size: 20,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              '新規作成',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  // Constellation list
                  Flexible(
                    child: ListView.builder(
                      shrinkWrap: true,
                      padding: EdgeInsets.zero,
                      itemCount:
                          _getConstellationsForCategory(_openCategory!).length,
                      itemBuilder: (context, index) {
                        final constellation =
                            _getConstellationsForCategory(_openCategory!)[index];
                        final isSelected =
                            widget.selectedIds.contains(constellation.id);
                        final color = _parseColor(constellation.color);
                        final showTopBorder = index > 0 ||
                            (_openCategory == 'custom' &&
                                widget.onCreateNew != null);

                        return GestureDetector(
                          onTap: () => _selectConstellation(constellation.id),
                          behavior: HitTestBehavior.opaque,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Colors.white.withValues(alpha: 0.1)
                                  : Colors.transparent,
                              border: showTopBorder
                                  ? const Border(
                                      top: BorderSide(
                                        color: Color(0xFF334155),
                                        width: 0.5,
                                      ),
                                    )
                                  : null,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: BoxDecoration(
                                    color: color,
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
                                          color:
                                              Colors.white.withValues(alpha: 0.5),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isSelected)
                                  const Icon(
                                    Icons.check,
                                    color: Color(0xFF22C55E),
                                    size: 20,
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

        if (_openCategory != null) const SizedBox(height: 8),

        // Category buttons (centered)
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: Dimensions.md,
            vertical: Dimensions.sm,
          ),
          decoration: const BoxDecoration(
            border: Border(
              top: BorderSide(color: Color(0xFF334155), width: 0.5),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _CategoryButton(
                label: 'ライブ',
                isOpen: _openCategory == 'live',
                onTap: () => _toggleCategory('live'),
              ),
              const SizedBox(width: 8),
              _CategoryButton(
                label: '推し座',
                isOpen: _openCategory == 'custom',
                onTap: () => _toggleCategory('custom'),
              ),
              const SizedBox(width: 8),
              _CategoryButton(
                label: 'アルバム',
                isOpen: _openCategory == 'album',
                onTap: () => _toggleCategory('album'),
              ),
            ],
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

class _CategoryButton extends StatelessWidget {
  final String label;
  final bool isOpen;
  final VoidCallback onTap;

  const _CategoryButton({
    required this.label,
    required this.isOpen,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isOpen
              ? Colors.white.withValues(alpha: 0.2)
              : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isOpen ? Colors.white : Colors.white.withValues(alpha: 0.7),
                fontSize: 13,
                fontWeight: isOpen ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              isOpen ? Icons.expand_less : Icons.expand_more,
              size: 16,
              color: isOpen ? Colors.white : Colors.white.withValues(alpha: 0.7),
            ),
          ],
        ),
      ),
    );
  }
}
