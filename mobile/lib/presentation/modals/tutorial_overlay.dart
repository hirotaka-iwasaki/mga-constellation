import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String _tutorialKey = 'mga-tutorial-completed';
const String _tutorialVersion = '1';

class TutorialStep {
  final String title;
  final String? description;
  final IconData? icon;

  const TutorialStep({
    required this.title,
    this.description,
    this.icon,
  });
}

const List<TutorialStep> _tutorialSteps = [
  TutorialStep(
    title: 'Mrs. GREEN APPLEの\n楽曲を星に見立てた星図です',
    icon: Icons.auto_awesome,
  ),
  TutorialStep(
    title: '星をタップすると\n曲が表示されます',
    icon: Icons.touch_app,
  ),
  TutorialStep(
    title: 'ライブのセットリストや\nアルバム収録曲を選ぶと',
    icon: Icons.library_music,
  ),
  TutorialStep(
    title: 'セトリや収録曲で\n星座が作れます',
    icon: Icons.auto_graph,
  ),
  TutorialStep(
    title: '自分で好きな曲を集めて\n"推し座"も作れます',
    icon: Icons.favorite,
  ),
  TutorialStep(
    title: '推し座が作れたら\nメニューからシェアしてみてね',
    icon: Icons.share,
  ),
];

class TutorialOverlay extends StatefulWidget {
  final VoidCallback onComplete;

  const TutorialOverlay({
    super.key,
    required this.onComplete,
  });

  /// Check if tutorial should be shown
  static Future<bool> shouldShow() async {
    final prefs = await SharedPreferences.getInstance();
    final completedVersion = prefs.getString(_tutorialKey);
    return completedVersion != _tutorialVersion;
  }

  /// Mark tutorial as completed
  static Future<void> markCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tutorialKey, _tutorialVersion);
  }

  @override
  State<TutorialOverlay> createState() => _TutorialOverlayState();
}

class _TutorialOverlayState extends State<TutorialOverlay>
    with SingleTickerProviderStateMixin {
  int _currentStep = 0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < _tutorialSteps.length - 1) {
      setState(() {
        _currentStep++;
      });
    } else {
      _complete();
    }
  }

  void _skip() {
    _complete();
  }

  void _complete() async {
    await TutorialOverlay.markCompleted();
    _animationController.reverse().then((_) {
      widget.onComplete();
    });
  }

  @override
  Widget build(BuildContext context) {
    final step = _tutorialSteps[_currentStep];
    final isLastStep = _currentStep == _tutorialSteps.length - 1;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: GestureDetector(
        onTap: _nextStep,
        child: Container(
          color: const Color(0xFF020617).withValues(alpha: 0.9),
          child: SafeArea(
            child: Column(
              children: [
                // Skip button
                Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: TextButton(
                      onPressed: _skip,
                      child: Text(
                        'スキップ',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 14,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ),
                  ),
                ),

                const Spacer(),

                // Step content
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: Column(
                    key: ValueKey(_currentStep),
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (step.icon != null)
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            step.icon,
                            size: 40,
                            color: const Color(0xFF34D399),
                          ),
                        ),
                      const SizedBox(height: 32),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 40),
                        child: Text(
                          step.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w500,
                            height: 1.4,
                            decoration: TextDecoration.none,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      if (step.description != null) ...[
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 40),
                          child: Text(
                            step.description!,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.6),
                              fontSize: 14,
                              decoration: TextDecoration.none,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 48),

                // Step indicators
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    _tutorialSteps.length,
                    (index) => Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: index == _currentStep
                            ? Colors.white
                            : Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Next button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _nextStep,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0F172A),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: Text(
                        isLastStep ? 'はじめる' : '次へ',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),

                const Spacer(),

                // Tap hint
                Padding(
                  padding: const EdgeInsets.only(bottom: 32),
                  child: Text(
                    'タップで次へ',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.3),
                      fontSize: 12,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
