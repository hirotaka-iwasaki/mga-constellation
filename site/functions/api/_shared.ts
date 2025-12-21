/**
 * 共有定義 - 有効なアイデアIDリスト
 */

export const VALID_IDEA_IDS = [
  // explore（探索・発見）
  'explore-song-analysis',
  'explore-concept-constellation',
  'explore-lucky-star',
  'explore-first-live-link',
  'explore-progress-counter',
  'explore-easter-egg',
  'explore-common-songs',
  'explore-guide-mode',
  'explore-complete-constellation',
  'explore-quiz',
  'explore-audio-preview',
  'explore-live-gallery',
  'explore-ar-mode',
  'explore-storyline',

  // share（共有・カスタマイズ）
  'share-url-short',
  'share-hashtag',
  'share-diagnosis',
  'share-complete-badge',
  'share-dynamic-ogp',

  // display（表示・演出）
  'display-jacket',
  'display-mv-thumbnail',
  'display-artist-photo',
  'display-song-label',
  'display-phase',
  'display-pulse-animation',
  'display-shooting-star',
  'display-bg-color',
  'display-color-theme',

  // utility（便利機能）
  'utility-pwa',
  'utility-spotify',
  'utility-apple-music',
  'utility-i18n',
] as const

export type IdeaId = typeof VALID_IDEA_IDS[number]
