import 'package:go_router/go_router.dart';
import 'package:mga_constellation/presentation/star_field/star_field_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const StarFieldScreen(),
    ),
  ],
);
