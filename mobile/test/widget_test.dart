import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mga_constellation/app/app.dart';

void main() {
  testWidgets('App renders without error', (WidgetTester tester) async {
    // Build the app with ProviderScope
    await tester.pumpWidget(
      const ProviderScope(
        child: MgaConstellationApp(),
      ),
    );

    // Verify app starts
    expect(find.byType(MgaConstellationApp), findsOneWidget);
  });
}
