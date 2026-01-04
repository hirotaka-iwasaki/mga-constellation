import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mga_constellation/app/routes.dart';
import 'package:mga_constellation/core/constants/colors.dart';

class MgaConstellationApp extends StatelessWidget {
  const MgaConstellationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'MGA Constellation',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.accent,
          secondary: AppColors.accent,
          surface: AppColors.surface,
        ),
        textTheme: GoogleFonts.notoSansJpTextTheme(
          ThemeData.dark().textTheme,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
      ),
      routerConfig: appRouter,
    );
  }
}
