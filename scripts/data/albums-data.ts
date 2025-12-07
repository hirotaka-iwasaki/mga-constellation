/**
 * albums-data.ts
 * アルバム・シングルの収録曲データ
 */

export interface Album {
  id: string;
  name: string;
  type: 'album' | 'mini' | 'best';
  releaseDate: string;
  color: string;
  songs: string[]; // 収録順
}

export const ALBUMS: Album[] = [
  // ミニアルバム
  {
    id: 'introduction',
    name: 'Introduction',
    type: 'mini',
    releaseDate: '2014-07-05',
    color: '#94a3b8',
    songs: ['HeLLo', '藍', 'スターダム', 'FACTORY', 'リスキーゲーム', '慶びの種'],
  },
  {
    id: 'progressive',
    name: 'Progressive',
    type: 'mini',
    releaseDate: '2015-02-18',
    color: '#a78bfa',
    songs: ['我逢人', 'ナニヲナニヲ', 'CONFLICT', 'アンゼンパイ', '日々と君', 'WaLL FloWeR'],
  },
  {
    id: 'variety',
    name: 'Variety',
    type: 'mini',
    releaseDate: '2015-07-08',
    color: '#f472b6',
    songs: ['StaRt', 'L.P', 'VIP', 'ゼンマイ', '道徳と皿'],
  },
  {
    id: 'unity',
    name: 'Unity',
    type: 'mini',
    releaseDate: '2022-07-08',
    color: '#38bdf8',
    songs: ['ニュー・マイ・ノーマル', 'ダンスホール', 'ブルーアンビエンス', '君を知らない', '延々', 'Part of me'],
  },

  // フルアルバム
  {
    id: 'twelve',
    name: 'TWELVE',
    type: 'album',
    releaseDate: '2016-01-13',
    color: '#4ade80',
    songs: [
      'Speaking', '愛情と矛先', 'パブリック', 'キコリ時計', '私', 'No.7',
      'ミスカサズ', 'SimPle', 'InTerLuDe 〜白い朝〜', 'Hug', '庶幾の唄', 'えほん', '恋と吟',
    ],
  },
  {
    id: 'mrs-green-apple',
    name: 'Mrs. GREEN APPLE',
    type: 'album',
    releaseDate: '2017-01-11',
    color: '#22d3d1',
    songs: [
      'Lion', 'In the Morning', 'おもちゃの兵隊', '絶世生物', 'soFt-dRink',
      '鯨の唄', 'うブ', 'サママ・フェスティバル！', 'Oz', 'ツキマシテハ', 'Just a Friend', 'JOURNEY',
    ],
  },
  {
    id: 'ensemble',
    name: 'ENSEMBLE',
    type: 'album',
    releaseDate: '2018-04-18',
    color: '#fb923c',
    songs: [
      'WanteD! WanteD!', 'PARTY', 'アウフヘーベン', 'はじまり', 'They are',
      'SPLASH!!!', 'REVERSE', 'Coffee', 'Love me, Love you', 'Log', '春愁', '光のうた',
    ],
  },
  {
    id: 'attitude',
    name: 'Attitude',
    type: 'album',
    releaseDate: '2019-10-02',
    color: '#ef4444',
    songs: [
      'Attitude', 'インフェルノ', 'ロマンチシズム', '僕のこと', 'CHEERS',
      '青と夏', 'How-to', 'クダリ', '点描の唄', 'Viking', 'lovin\'',
      'Ke-Mo Sah-Bee', '嘘じゃないよ', 'Soup', 'Circle',
    ],
  },
  {
    id: 'antenna',
    name: 'ANTENNA',
    type: 'album',
    releaseDate: '2023-07-05',
    color: '#4ade80',
    songs: [
      'ANTENNA', 'Magic', 'Blizzard', 'ダンスホール', 'アンラブレス',
      'Loneliness', 'Soranji', 'norn', '私は最強', 'ケセラセラ',
      '橙', 'Doodle', 'BFF', 'Feeling', 'フロリジナル',
    ],
  },

  // ベストアルバム
  {
    id: '5-best',
    name: '5',
    type: 'best',
    releaseDate: '2020-07-08',
    color: '#fbbf24',
    songs: [
      'StaRt', 'Speaking', 'サママ・フェスティバル！', 'In the Morning', 'WanteD! WanteD!',
      '青と夏', '僕のこと', 'インフェルノ', 'PRESENT', 'Theater', 'アボイドノート',
      // Disc 2 など追加可能
    ],
  },
  {
    id: '10-best',
    name: '10',
    type: 'best',
    releaseDate: '2025-07-08',
    color: '#e879f9',
    songs: [
      'ニュー・マイ・ノーマル', 'ダンスホール', 'Soranji', '私は最強', 'ケセラセラ',
      'Magic', 'ANTENNA', 'ナハトムジーク', 'ライラック', 'Dear',
      'コロンブス', 'アポロドロス', 'familie', 'ビターバカンス', 'ダーリン',
      'クスシキ', '天国', 'breakfast', '慶びの種',
    ],
  },

];
