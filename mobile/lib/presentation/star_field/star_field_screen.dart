import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mga_constellation/core/constants/colors.dart';
import 'package:mga_constellation/data/repositories/song_repository.dart'
    show songsProvider, positionsProvider, essencesProvider;
import 'package:mga_constellation/data/repositories/constellation_repository.dart'
    show constellationsProvider;
import 'package:mga_constellation/data/repositories/custom_constellation_repository.dart';
import 'package:mga_constellation/presentation/star_field/widgets/star_field_canvas.dart';
import 'package:mga_constellation/presentation/modals/tutorial_overlay.dart';

class StarFieldScreen extends ConsumerStatefulWidget {
  const StarFieldScreen({super.key});

  @override
  ConsumerState<StarFieldScreen> createState() => _StarFieldScreenState();
}

class _StarFieldScreenState extends ConsumerState<StarFieldScreen> {
  bool _showTutorial = false;
  bool _tutorialChecked = false;

  @override
  void initState() {
    super.initState();
    _checkTutorial();
  }

  Future<void> _checkTutorial() async {
    final shouldShow = await TutorialOverlay.shouldShow();
    if (mounted) {
      setState(() {
        _showTutorial = shouldShow;
        _tutorialChecked = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final songsAsync = ref.watch(songsProvider);
    final positionsAsync = ref.watch(positionsProvider);
    final constellationsAsync = ref.watch(constellationsProvider);
    final customConstellations = ref.watch(customConstellationsProvider);
    final essencesAsync = ref.watch(essencesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          songsAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.accent),
            ),
            error: (error, stack) => Center(
              child: Text(
                'エラーが発生しました: $error',
                style: const TextStyle(color: AppColors.textPrimary),
              ),
            ),
            data: (songs) => positionsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.accent),
              ),
              error: (error, stack) => Center(
                child: Text(
                  'エラーが発生しました: $error',
                  style: const TextStyle(color: AppColors.textPrimary),
                ),
              ),
              data: (positions) => constellationsAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.accent),
                ),
                error: (error, stack) => Center(
                  child: Text(
                    'エラーが発生しました: $error',
                    style: const TextStyle(color: AppColors.textPrimary),
                  ),
                ),
                data: (constellations) => StarFieldCanvas(
                  songs: songs,
                  positions: positions,
                  constellations: [...constellations, ...customConstellations],
                  customConstellations: customConstellations,
                  essences: essencesAsync.valueOrNull ?? {},
                  onSaveCustomConstellation: (constellation) {
                    final notifier = ref.read(customConstellationsProvider.notifier);
                    // Check if it's an update or a new constellation
                    final existing = customConstellations.any((c) => c.id == constellation.id);
                    if (existing) {
                      notifier.update(constellation);
                    } else {
                      notifier.add(constellation);
                    }
                  },
                  onDeleteCustomConstellation: (id) {
                    ref.read(customConstellationsProvider.notifier).delete(id);
                  },
                ),
              ),
            ),
          ),
          // Tutorial overlay
          if (_tutorialChecked && _showTutorial)
            TutorialOverlay(
              onComplete: () {
                setState(() => _showTutorial = false);
              },
            ),
        ],
      ),
    );
  }
}
