# Mrs. GREEN APPLE Constellation Map - ネイティブアプリ化設計書

## 概要

現在のWebアプリケーション（Astro + Preact）をネイティブモバイルアプリ化する設計書。

## 要件

- **プラットフォーム**: iOS + Android 両対応
- **優先事項**: パフォーマンス・滑らかさ（60fps目標）
- **配布**: App Store / Google Play 公開リリース

---

## 技術選定: Flutter

### 比較サマリー

| 観点 | Flutter | React Native | Native (Swift+Kotlin) |
|------|---------|--------------|----------------------|
| パフォーマンス | ◎ 60fps (Skia) | ○ 60fps (Skia) | ◎ 最高 |
| 開発効率 | ◎ 1コードベース | ○ 1コードベース | △ 2コードベース |
| コード再利用 | △ 型定義のみ | ○ 70%再利用可 | × なし |
| アプリサイズ | △ 15MB | △ 20MB | ◎ 8MB |
| 起動時間 | ○ 800ms | ○ 600ms | ◎ 300ms |

### Flutter選定理由

1. **パフォーマンス要件を満たす**: Skiaエンジンで60fps描画、`CustomPainter`で星座マップを効率的にレンダリング
2. **開発効率**: 単一コードベースでiOS/Android両対応、Hot Reloadで高速開発
3. **ジェスチャー対応**: `GestureDetector`と`InteractiveViewer`で複雑なパン/ズーム/ピンチを実装済み
4. **ストア公開実績**: App Store/Google Playでの公開ツールチェーンが成熟

---

## ディレクトリ配置（モノレポ構成）

```
mga-constellation/
├── scripts/           # データ生成（共通）
├── site/              # Web版 (Astro+Preact)
├── mobile/            # Flutter版 ← 新規作成
│   ├── lib/
│   ├── assets/
│   │   └── data/     # JSONデータ
│   ├── ios/
│   ├── android/
│   └── pubspec.yaml
├── Makefile           # 更新: mobile用コマンド追加
└── CLAUDE.md          # 更新: mobile開発手順追加
```

### Web版との共通化

| 項目 | 共有方法 | 備考 |
|-----|---------|------|
| **JSONデータ** | `make data`でコピー | songs.json, positions.json, constellations.json, essences.json |
| **データ生成スクリプト** | そのまま使用 | `scripts/01-05` |
| **色定義** | 手動移植 | Dartのconstantsに変換 |
| **型定義** | 概念的に共通 | TypeScript → Dart freezedモデル |

### データ同期フロー

```bash
# 新曲追加時
1. scripts/data/ にデータ追加
2. make data           # JSONを生成
3. make sync-mobile    # Flutter assetsにコピー（新コマンド）
```

---

## Flutterプロジェクト構成

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart                    # MaterialApp設定
│   │   └── routes.dart                 # ルート定義
│   ├── core/
│   │   ├── constants/
│   │   │   ├── colors.dart             # テーマカラー
│   │   │   └── dimensions.dart         # グリッド寸法 (100x100)
│   │   └── utils/
│   │       ├── coordinate_transform.dart  # SVG↔画面座標変換
│   │       └── animation_utils.dart
│   ├── data/
│   │   ├── models/
│   │   │   ├── song.dart              # Songモデル
│   │   │   ├── star_position.dart     # StarPositionモデル
│   │   │   ├── constellation.dart     # Constellationモデル
│   │   │   └── song_essence.dart      # SongEssenceモデル
│   │   ├── repositories/
│   │   │   ├── song_repository.dart   # songs.json読み込み
│   │   │   ├── constellation_repository.dart
│   │   │   └── custom_constellation_repository.dart  # SharedPrefs
│   │   └── services/
│   │       ├── vote_service.dart      # 投票API連携
│   │       └── share_service.dart     # 画像生成+共有
│   ├── presentation/
│   │   ├── star_field/
│   │   │   ├── star_field_screen.dart    # メイン画面
│   │   │   ├── star_field_controller.dart # 状態管理
│   │   │   ├── painters/
│   │   │   │   ├── star_painter.dart      # 星描画
│   │   │   │   └── constellation_line_painter.dart  # 星座線描画
│   │   │   └── widgets/
│   │   │       ├── star_field_canvas.dart
│   │   │       ├── song_detail_card.dart
│   │   │       └── constellation_tags.dart
│   │   ├── modals/
│   │   │   ├── song_detail_modal.dart
│   │   │   ├── category_selector_modal.dart
│   │   │   ├── custom_builder_modal.dart
│   │   │   ├── search_modal.dart
│   │   │   ├── roadmap_modal.dart
│   │   │   └── tutorial_overlay.dart
│   │   └── shared/
│   │       └── bottom_sheet_base.dart
│   └── state/
│       ├── star_field_state.dart      # Riverpod状態
│       └── constellation_state.dart
├── assets/
│   └── data/
│       ├── songs.json
│       ├── positions.json
│       ├── constellations.json
│       └── essences.json
├── test/
├── ios/
├── android/
└── pubspec.yaml
```

---

## 主要ライブラリ

```yaml
dependencies:
  # 状態管理・アーキテクチャ
  flutter_riverpod: ^2.4.0    # 状態管理
  flutter_hooks: ^0.20.0      # Hooks（UIロジック簡素化）
  freezed_annotation: ^2.4.1  # イミュータブルモデル
  go_router: ^12.1.1          # 宣言的ナビゲーション・ディープリンク

  # アニメーション
  flutter_animate: ^4.3.0     # 宣言的アニメーション
  rive: ^0.12.0               # 高性能ベクターアニメーション（アイコン等）
  lottie: ^2.7.0              # JSON/After Effectsアニメーション

  # UI コンポーネント
  flutter_slidable: ^3.0.0    # スワイプアクション（リスト項目）
  smooth_page_indicator: ^1.1.0  # ページインジケーター
  nested_scroll_view_plus: ^1.0.0  # 高度なネストスクロール

  # プラットフォーム対応
  scrolls_to_top: ^2.0.0      # iOS ステータスバータップでスクロールトップ
  google_fonts: ^6.1.0        # カスタムフォント

  # ストレージ・通信
  shared_preferences: ^2.2.2  # ローカルストレージ
  dio: ^5.4.0                 # HTTP

  # 共有・画像
  flutter_share_plus: ^7.2.1  # 共有機能
  screenshot: ^2.1.0          # 画像生成
  extended_image: ^8.2.0      # 高度な画像処理・キャッシュ

  # ユーティリティ
  collection: ^1.18.0         # コレクション操作
  visibility_detector: ^0.4.0 # 可視性検出（パフォーマンス最適化）

dev_dependencies:
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.1            # モック
  golden_toolkit: ^0.15.0     # ゴールデンテスト
  freezed: ^2.4.5             # コード生成
  json_serializable: ^6.7.1   # JSON変換
  build_runner: ^2.4.7        # コード生成実行
```

---

## UI/UXデザイン原則（mixi2参考）

mixi2のFlutter実装から学んだ、洗練されたUI/UXを実現するための原則。

### デザインシステム

#### カラーパレット
```dart
// core/constants/colors.dart
class AppColors {
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

  // 星座線カラー（各星座固有色）
  // → constellations.jsonから読み込み
}
```

#### タイポグラフィ
```dart
// Google Fontsで日本語対応フォント
// Noto Sans JP（可読性重視）またはNoto Serif JP（エレガント）
theme: ThemeData(
  textTheme: GoogleFonts.notoSansJpTextTheme(),
)
```

#### スペーシングシステム（8pxグリッド）
```dart
class Spacing {
  static const xs = 4.0;   // 極小
  static const sm = 8.0;   // 小
  static const md = 16.0;  // 中（標準）
  static const lg = 24.0;  // 大
  static const xl = 32.0;  // 特大
}
```

#### 角丸（統一感のため12-16px）
```dart
class AppRadius {
  static const card = 16.0;
  static const button = 12.0;
  static const modal = 20.0;
}
```

### アニメーション設計

#### マイクロインタラクション
星タップ時やナビゲーション時に小さなアニメーションでフィードバック：

```dart
// 星タップ時のパルスアニメーション
AnimatedScale(
  scale: isSelected ? 1.3 : 1.0,
  duration: Duration(milliseconds: 200),
  curve: Curves.easeOutBack,
  child: StarWidget(),
)

// ボトムナビアイコンのタップアニメーション（mixi2風）
AnimatedRotation(
  turns: _isTapped ? 0.1 : 0,  // 軽い回転
  duration: Duration(milliseconds: 300),
  curve: Curves.elasticOut,
  child: Icon(Icons.star),
)
```

#### 星座線の描画アニメーション
```dart
// スタッガードアニメーション（各線を遅延表示）
for (var i = 0; i < lines.length; i++) {
  final delay = Duration(milliseconds: i * 150);
  // 各線をフェードイン + 描画アニメーション
}
```

#### Rive/Lottie活用シーン
- **Rive**: 星のキラキラエフェクト、ローディングアニメーション
- **Lottie**: チュートリアルアニメーション、成功時のエフェクト

### プラットフォーム対応

#### iOS固有対応
```dart
// ステータスバータップでスクロールトップ
ScrollsToTop(
  onScrollsToTop: () => _scrollController.animateTo(0, ...),
  child: ListView(...),
)

// バウンススクロール
ScrollConfiguration(
  behavior: CupertinoScrollBehavior(),
  child: ListView(...),
)
```

#### パフォーマンス最適化
```dart
// 画面内の要素のみアニメーション
VisibilityDetector(
  key: Key('star-$id'),
  onVisibilityChanged: (info) {
    if (info.visibleFraction > 0) {
      _startAnimation();
    } else {
      _pauseAnimation();
    }
  },
  child: AnimatedStar(),
)
```

### レイアウトパターン

#### 折りたたみヘッダー（詳細画面）
```dart
NestedScrollView(
  headerSliverBuilder: (context, innerBoxIsScrolled) => [
    SliverAppBar(
      expandedHeight: 200,
      floating: false,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(songTitle),
        background: StarFieldPreview(),
      ),
    ),
  ],
  body: SongDetailContent(),
)
```

#### スワイプアクション（リスト項目）
```dart
// カスタム星座リストでの削除等
Slidable(
  endActionPane: ActionPane(
    motion: DrawerMotion(),
    children: [
      SlidableAction(
        onPressed: (_) => _deleteConstellation(id),
        backgroundColor: Colors.red,
        icon: Icons.delete,
      ),
    ],
  ),
  child: ConstellationListTile(),
)
```

### アクセシビリティ

#### テキストサイズ調整
```dart
// 設定画面でスライダー調整 → アプリ全体に反映
MediaQuery(
  data: MediaQuery.of(context).copyWith(
    textScaleFactor: userPreferredScale,  // 0.8 ~ 1.4
  ),
  child: MaterialApp(...),
)
```

#### セマンティクス
```dart
Semantics(
  label: '${song.title}の星。タップで詳細を表示',
  child: StarWidget(song: song),
)
```

---

## 実装フェーズ

### Phase 1: 基盤構築（Week 1-2）
- Flutterプロジェクト作成
- データモデル定義（Song, StarPosition, Constellation, SongEssence）
- JSONアセット読み込み・Repository層
- 基本ナビゲーション設定

### Phase 2: 星座マップコア（Week 3-4）
- `StarPainter` - 星の描画（グラデーショングロー）
- ジェスチャー実装（パン、ピンチズーム、ダブルタップリセット）
- ViewBox変換ロジック（100x100座標系）
- 星タップ検出

### Phase 3: 星座線アニメーション（Week 5）
- `ConstellationLinePainter` - ドット線描画
- スタッガードアニメーション（遅延表示）
- 選択状態によるハイライト

### Phase 4: モーダル・詳細画面（Week 6）
- 曲詳細カード（スワイプナビゲーション）
- カテゴリセレクター（ライブ/アルバム/推し座）
- 曲詳細モーダル（スクロール、ドラッグクローズ）

### Phase 5: 検索・ナビゲーション（Week 7）
- 検索モーダル（曲名検索）
- 星間ナビゲーション（前/次）
- 星座選択によるフィルタリング

### Phase 6: カスタム星座（Week 8）
- カスタム星座ビルダー
- ドラッグ並べ替え
- SharedPreferences保存

### Phase 7: 共有・仕上げ（Week 9）
- Canvas画像生成
- 共有シート連携
- チュートリアルオーバーレイ
- ロードマップ/投票API連携

### Phase 8: テスト・リリース（Week 10）
- Android チェック
- 単体テスト・ウィジェットテスト
- ゴールデンテスト（UI検証）
- ストアメタデータ作成
- App Store / Google Play 申請
- web 版にアプリへのリンク追加
- CI/CD 整備

---

## コア機能の実装詳細

### 星座マップ描画（StarPainter）

```dart
class StarPainter extends CustomPainter {
  final List<StarPosition> positions;
  final Set<String> highlightedIds;
  final String? selectedId;
  final Offset offset;
  final double scale;

  @override
  void paint(Canvas canvas, Size size) {
    for (final pos in positions) {
      final isHighlighted = highlightedIds.contains(pos.id);
      final isSelected = pos.id == selectedId;

      // 座標変換: 100x100 → 画面座標
      final screenPoint = _transformPoint(pos, size);

      // グローエフェクト（ラジアルグラデーション）
      final glowRadius = isHighlighted ? 20.0 : 12.0;
      final gradient = RadialGradient(
        colors: [
          Colors.white.withOpacity(isHighlighted ? 0.8 : 0.3),
          Colors.transparent,
        ],
      );

      canvas.drawCircle(
        screenPoint,
        glowRadius / scale,
        Paint()..shader = gradient.createShader(
          Rect.fromCircle(center: screenPoint, radius: glowRadius / scale),
        ),
      );

      // 中心点
      canvas.drawCircle(
        screenPoint,
        (isHighlighted ? 6.0 : 3.0) / scale,
        Paint()..color = Colors.white,
      );
    }
  }

  Offset _transformPoint(StarPosition pos, Size size) {
    return Offset(
      (pos.x - offset.dx) * size.width / 100 * scale,
      (pos.y - offset.dy) * size.height / 100 * scale,
    );
  }
}
```

### ジェスチャーシステム

```dart
class StarFieldCanvas extends StatefulWidget {
  @override
  State<StarFieldCanvas> createState() => _StarFieldCanvasState();
}

class _StarFieldCanvasState extends State<StarFieldCanvas> {
  Offset _offset = Offset.zero;
  double _scale = 1.0;
  double _baseScale = 1.0;
  Offset _focalPoint = Offset.zero;
  DateTime? _lastTapTime;

  void _onScaleStart(ScaleStartDetails details) {
    _baseScale = _scale;
    _focalPoint = details.focalPoint;
  }

  void _onScaleUpdate(ScaleUpdateDetails details) {
    setState(() {
      // ズーム処理
      final newScale = (_baseScale * details.scale).clamp(0.5, 5.0);

      // フォーカルポイント中心でズーム
      final focalInSvg = _screenToSvg(_focalPoint);
      _scale = newScale;
      _offset = _adjustOffsetForZoom(focalInSvg, newScale);

      // パン処理
      final delta = details.focalPoint - _focalPoint;
      _offset += Offset(delta.dx, delta.dy) / _scale;
      _focalPoint = details.focalPoint;

      // 境界クランプ
      _offset = _clampOffset(_offset);
    });
  }

  void _onDoubleTap() {
    setState(() {
      _offset = Offset.zero;
      _scale = 1.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onScaleStart: _onScaleStart,
      onScaleUpdate: _onScaleUpdate,
      onDoubleTap: _onDoubleTap,
      onTapUp: _onTapUp,
      child: CustomPaint(
        painter: StarPainter(
          positions: widget.positions,
          offset: _offset,
          scale: _scale,
          highlightedIds: widget.highlightedIds,
          selectedId: widget.selectedId,
        ),
        foregroundPainter: ConstellationLinePainter(
          lines: widget.constellationLines,
          offset: _offset,
          scale: _scale,
          animationProgress: _animationController.value,
        ),
        size: Size.infinite,
      ),
    );
  }
}
```

### 星座線アニメーション

```dart
class ConstellationLinePainter extends CustomPainter {
  final List<ConstellationLine> lines;
  final double animationProgress; // 0.0 ~ 1.0

  @override
  void paint(Canvas canvas, Size size) {
    for (var i = 0; i < lines.length; i++) {
      final line = lines[i];
      final lineDelay = i * 0.15; // スタッガード遅延

      final dots = _calculateDots(line.points);

      for (var j = 0; j < dots.length; j++) {
        final dot = dots[j];
        final dotDelay = lineDelay + j * 0.008;
        final dotProgress = ((animationProgress - dotDelay) / 0.2).clamp(0.0, 1.0);

        if (dotProgress > 0) {
          canvas.drawCircle(
            dot,
            3.0, // ドット半径
            Paint()..color = line.color.withOpacity(0.4 * dotProgress),
          );
        }
      }
    }
  }

  List<Offset> _calculateDots(List<Offset> points) {
    final dots = <Offset>[];
    for (var i = 0; i < points.length - 1; i++) {
      final p1 = points[i];
      final p2 = points[i + 1];
      final dist = (p2 - p1).distance;
      final numDots = (dist / 12).floor(); // 12px間隔

      for (var j = 1; j < numDots; j++) {
        final t = j / numDots;
        dots.add(Offset.lerp(p1, p2, t)!);
      }
    }
    return dots;
  }
}
```

---

## 参照すべきWebコード

| ファイル | 内容 |
|---------|------|
| `site/src/components/StarField.tsx` | メインコンポーネント（ジェスチャー、描画、状態管理） |
| `site/src/types.ts` | データ型定義（Dartモデルに変換） |
| `site/src/components/ShareButton.tsx` | Canvas2D画像生成ロジック |
| `site/src/components/CustomConstellationBuilder.tsx` | ドラッグ並べ替えUI |
| `site/src/components/SongDetailModal.tsx` | 詳細モーダルUI/UX |
| `site/src/content/*.json` | データファイル（アセットとしてバンドル） |

---

## CI/CD（Codemagic）

### ツール選定

| ツール | 特徴 | 料金 |
|--------|------|------|
| **Codemagic** ✅ | Flutter特化、証明書管理が楽 | 500分/月 無料 |
| GitHub Actions + Fastlane | 柔軟だが設定複雑 | 2000分/月 無料 |
| Bitrise | モバイルCI/CDの定番 | 週90分 無料 |

**Codemagic選定理由**:
- Apple証明書の自動管理（手動署名不要）
- App Store Connect / Google Playへの直接アップロード
- モノレポ対応（`working_directory`指定）
- Flutterビルドキャッシュで高速化

### 設定ファイル

```yaml
# mobile/codemagic.yaml
workflows:
  # ====================
  # iOS Production
  # ====================
  ios-release:
    name: iOS Release
    working_directory: mobile
    max_build_duration: 60
    environment:
      flutter: stable
      xcode: latest
      cocoapods: default
      groups:
        - app_store_credentials  # Codemagic UIで設定
    triggering:
      events:
        - push
      branch_patterns:
        - pattern: main
          include: true
      cancel_previous_builds: true

    scripts:
      - name: Get Flutter packages
        script: flutter pub get

      - name: Build IPA
        script: |
          flutter build ipa \
            --release \
            --export-options-plist=/Users/builder/export_options.plist

    artifacts:
      - build/ios/ipa/*.ipa

    publishing:
      app_store_connect:
        # Codemagic UIでAPI Key設定
        auth: integration
        submit_to_testflight: true
        # 自動でApp Store審査提出する場合
        # submit_to_app_store: true

  # ====================
  # Android Production
  # ====================
  android-release:
    name: Android Release
    working_directory: mobile
    max_build_duration: 60
    environment:
      flutter: stable
      java: 17
      groups:
        - google_play_credentials  # Codemagic UIで設定
    triggering:
      events:
        - push
      branch_patterns:
        - pattern: main
          include: true

    scripts:
      - name: Get Flutter packages
        script: flutter pub get

      - name: Build AAB
        script: |
          flutter build appbundle \
            --release

    artifacts:
      - build/app/outputs/bundle/release/*.aab

    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: production  # または internal, alpha, beta

  # ====================
  # PR Check (テスト用)
  # ====================
  pr-check:
    name: PR Check
    working_directory: mobile
    environment:
      flutter: stable
    triggering:
      events:
        - pull_request
      branch_patterns:
        - pattern: main
          include: true

    scripts:
      - name: Get packages
        script: flutter pub get

      - name: Analyze
        script: flutter analyze

      - name: Test
        script: flutter test

      - name: Build (確認用)
        script: |
          flutter build apk --debug
          flutter build ios --no-codesign
```

### Codemagic初期設定手順

#### 1. Codemagicアカウント設定
```
1. https://codemagic.io でGitHubログイン
2. mga-constellationリポジトリを追加
3. Working directory: mobile を設定
```

#### 2. iOS署名設定（自動管理）
```
1. Codemagic UI → Code signing → iOS
2. "Automatic code signing" を選択
3. Apple Developer Portalの認証情報を入力
   - App Store Connect API Key（推奨）
   - または Apple ID + App-specific password
```

#### 3. Android署名設定
```
1. Keystore生成（初回のみ）
   keytool -genkey -v -keystore upload-keystore.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias upload

2. Codemagic UI → Code signing → Android
3. Keystoreファイルをアップロード
4. Google Play Service Account JSONを設定
```

#### 4. 環境変数グループ作成
```
Codemagic UI → Teams → Environment variables

グループ: app_store_credentials
- APP_STORE_CONNECT_KEY_ID
- APP_STORE_CONNECT_ISSUER_ID
- APP_STORE_CONNECT_PRIVATE_KEY

グループ: google_play_credentials
- GCLOUD_SERVICE_ACCOUNT_CREDENTIALS (JSON)
```

### デプロイフロー

```
[main push] → Codemagic検知
    ↓
[flutter build] → IPA / AAB生成
    ↓
[App Store Connect] → TestFlight配信
[Google Play Console] → 内部テスト or 本番
    ↓
[審査] → 公開
```

### GitHub Actionsとの併用（オプション）

Webデプロイは既存のCloudflare Pages、モバイルのみCodemagic：

```yaml
# .github/workflows/mobile-trigger.yml（オプション）
# GitHub Actions → Codemagic Webhookトリガー
name: Trigger Mobile Build

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Codemagic
        run: |
          curl -X POST \
            -H "x-auth-token: ${{ secrets.CODEMAGIC_API_TOKEN }}" \
            -d '{"appId":"YOUR_APP_ID","workflowId":"ios-release"}' \
            https://api.codemagic.io/builds
```

---

## ストア申請要件

### App Store (iOS)

- **スクリーンショット**: 6.7" (iPhone 16 Pro Max), 6.5" (iPhone 15 Plus), 12.9" (iPad Pro)
- **プライバシーポリシーURL**: 必須
- **データ収集**: 「データ収集なし」（ローカルストレージのみ）
- **カテゴリ**: ミュージック / エンターテインメント
- **年齢制限**: 4+

### Google Play

- **コンテンツレーティング**: 全ユーザー対象
- **データセーフティ**: 「データ収集なし」
- **Target SDK**: 34 (Android 14)
- **App Signing**: Play App Signing使用

### 共通

- アプリアイコン（各サイズ）
- スプラッシュ画面（星空アニメーション）
- 著作権表記（ファンメイド、非公式）
- アプリ説明文（日本語/英語）

---

## 実装時のベストプラクティス

### アーキテクチャ（mixi2参考）

```
presentation/  ← UI層（Widget）
    ↓ 参照
state/         ← 状態管理（Riverpod Provider）
    ↓ 参照
data/          ← データ層（Repository, Model）
```

- **Riverpod + Freezed**: 予測可能な状態管理、イミュータブルモデルでバグ防止
- **go_router**: 宣言的ルーティング、ディープリンク対応
- **flutter_hooks**: `useAnimationController`等でボイラープレート削減

### ウィジェット設計

#### Constウィジェットを活用
```dart
// ✅ 再ビルド不要な部分はconstで
const StarGlow(color: Colors.white)

// ❌ 毎回新しいインスタンスが作られる
StarGlow(color: Colors.white)
```

#### RepaintBoundaryで描画範囲を限定
```dart
// 頻繁にアニメーションする部分を分離
RepaintBoundary(
  child: CustomPaint(
    painter: StarPainter(...),
  ),
)
```

### パフォーマンスチェックリスト

- [ ] `flutter run --profile`でフレームレート確認
- [ ] `VisibilityDetector`で画面外アニメーション停止
- [ ] `extended_image`で画像キャッシュ
- [ ] `ListView.builder`で遅延読み込み
- [ ] `const`コンストラクタの最大活用
- [ ] DevToolsでリビルド範囲確認

### テスト戦略

```dart
// ゴールデンテスト（UI回帰テスト）
testWidgets('StarField renders correctly', (tester) async {
  await tester.pumpWidget(StarFieldScreen());
  await expectLater(
    find.byType(StarFieldScreen),
    matchesGoldenFile('goldens/star_field.png'),
  );
});

// インタラクションテスト
testWidgets('Tap star shows detail', (tester) async {
  await tester.pumpWidget(StarFieldScreen());
  await tester.tap(find.byKey(Key('star-song-001')));
  await tester.pumpAndSettle();
  expect(find.byType(SongDetailModal), findsOneWidget);
});
```

---

## 参考リソース

### mixi2 UI/UXデザイン分析

本設計書は以下のmixi2分析に基づく知見を反映：

- **UIコンポーネント構造**: カスタムボトムナビ、アニメーションアイコン
- **レイアウト＆アニメーション**: 8pxグリッド、マイクロインタラクション、スタッガードアニメーション
- **デザインシステム**: 統一されたカラー/タイポグラフィ/スペーシング/角丸

**参考記事**:
- [mixi2のUIデザインが素敵](https://note.com/akio_sakamoto/n/nb68fed54d7c7)
- [mixi2ライセンスページから学ぶFlutterパッケージ](https://memory-lovers.blog/entry/2024/12/19/085505)
- [インターンでmixi2を開発してきたよ](https://note.com/_kurikin/n/n6785b8f20e21)

---

## 今後の拡張

- ウィジェット対応（iOS 17+, Android 12+）
- Apple Watch / Wear OS コンパニオンアプリ
- プッシュ通知（新曲リリース通知）
- オフライン対応強化
