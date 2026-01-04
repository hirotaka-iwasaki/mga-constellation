import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // プライマリ：星空の深い青
  static const primary = Color(0xFF1A1A2E);

  // アクセント：控えめに使用（星のハイライト等）
  static const accent = Color(0xFFFFD700);

  // 背景：ダークテーマベース
  static const background = Color(0xFF0D0D1A);
  static const surface = Color(0xFF1A1A2E);

  // テキスト：高コントラスト
  static const textPrimary = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFB0B0B0);

  // 星の色
  static const starDefault = Color(0xFFFFFFFF);
  static const starGlow = Color(0x80FFFFFF);

  // 星座線はconstellations.jsonのcolorを使用
}
