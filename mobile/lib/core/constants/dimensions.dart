class Dimensions {
  Dimensions._();

  // グリッド寸法（SVG座標系）
  static const double gridWidth = 100.0;
  static const double gridHeight = 100.0;

  // スペーシングシステム（8pxグリッド）
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;

  // 角丸
  static const double radiusCard = 16.0;
  static const double radiusButton = 12.0;
  static const double radiusModal = 20.0;

  // 星のサイズ
  static const double starRadiusDefault = 3.0;
  static const double starRadiusHighlight = 6.0;
  static const double starGlowRadius = 12.0;
  static const double starGlowRadiusHighlight = 20.0;

  // ズーム制限
  static const double minScale = 0.5;
  static const double maxScale = 5.0;

  // 星座線ドット間隔
  static const double constellationDotSpacing = 12.0;
  static const double constellationDotRadius = 3.0;
}
