// data.js — ゲームバランス定義(敵 / ボス / 武器 / パッシブ / 出現スケジュール / ステージ配色)
'use strict';

const DATA = {

  // ---------- 敵(r はアート単位px, 実体半径はゲーム側で×SCALE) ----------
  enemies: {
    zombie:   { hp: 14,  spd: 38,  dmg: 8,  xp: 1, r: 7,  col: '#6fae4e' },
    bat:      { hp: 9,   spd: 88,  dmg: 6,  xp: 1, r: 5,  col: '#a86fd8' },
    skeleton: { hp: 24,  spd: 50,  dmg: 10, xp: 2, r: 7,  col: '#e8e6da' },
    ghost:    { hp: 34,  spd: 62,  dmg: 12, xp: 3, r: 6,  col: '#9fe8e4' },
    brute:    { hp: 105, spd: 30,  dmg: 18, xp: 6, r: 10, col: '#c46a4a' },
    imp:      { hp: 30,  spd: 108, dmg: 12, xp: 4, r: 5,  col: '#ff9b3d' },
  },

  // ---------- ボス(r はワールドpx直値) ----------
  bosses: {
    king:   { name: '腐肉の王 ROT KING',   hp: 1500, spd: 40, dmg: 24, r: 46, music: 'boss1', col: '#7fae4e' },
    wyrm:   { name: '白骨竜 BONE WYRM',    hp: 3200, spd: 55, dmg: 22, r: 52, music: 'boss2', col: '#e8e6da' },
    reaper: { name: '死神 THE REAPER',     hp: 5600, spd: 64, dmg: 30, r: 40, music: 'boss3', col: '#b98fff' },
  },

  // ---------- 出現スケジュール(t: 秒) ----------
  schedule: [
    { t: 0,   types: ['zombie'],                          interval: 1.0,  max: 50 },
    { t: 40,  types: ['zombie', 'bat'],                   interval: 0.8,  max: 90 },
    { t: 90,  types: ['bat', 'skeleton', 'zombie'],       interval: 0.65, max: 120 },
    { t: 150, types: ['skeleton', 'bat'],                 interval: 0.55, max: 150 },
    { t: 180, boss: 'king' },
    { t: 186, types: ['skeleton', 'ghost', 'zombie'],     interval: 0.6,  max: 160 },
    { t: 260, types: ['ghost', 'skeleton', 'bat'],        interval: 0.5,  max: 180 },
    { t: 320, types: ['ghost', 'brute', 'bat'],           interval: 0.5,  max: 190 },
    { t: 420, boss: 'wyrm' },
    { t: 426, types: ['brute', 'imp', 'ghost'],           interval: 0.45, max: 210 },
    { t: 520, types: ['imp', 'brute', 'skeleton'],        interval: 0.4,  max: 230 },
    { t: 570, event: 'horde' },
    { t: 600, types: ['imp', 'brute', 'ghost', 'skeleton'], interval: 0.35, max: 260 },
    { t: 632, event: 'horde' },
    { t: 660, boss: 'reaper' },
    { t: 666, types: ['imp', 'ghost', 'brute'],           interval: 0.42, max: 230 },
  ],

  // ---------- 武器(lv[0]=Lv1 … lv[4]=Lv5) ----------
  weapons: {
    bolt: {
      name: 'マジックボルト', desc: '最も近い敵へ魔法弾を放つ', icon: 'bolt',
      lv: [
        { cd: 1.1,  dmg: 10, count: 1, speed: 480, pierce: 0 },
        { cd: 1.0,  dmg: 12, count: 2, speed: 480, pierce: 0 },
        { cd: 0.95, dmg: 18, count: 2, speed: 520, pierce: 1 },
        { cd: 0.85, dmg: 22, count: 3, speed: 560, pierce: 1 },
        { cd: 0.72, dmg: 30, count: 4, speed: 600, pierce: 2 },
      ],
    },
    blade: {
      name: 'オービットブレード', desc: '周囲を回転する刃が敵を切り裂く', icon: 'blade',
      lv: [
        { count: 2, dmg: 9,  radius: 60,  rot: 2.8 },
        { count: 3, dmg: 11, radius: 66,  rot: 3.0 },
        { count: 3, dmg: 15, radius: 76,  rot: 3.3 },
        { count: 4, dmg: 18, radius: 86,  rot: 3.6 },
        { count: 6, dmg: 24, radius: 96,  rot: 4.0 },
      ],
    },
    thunder: {
      name: 'サンダー', desc: '落雷がランダムな敵を焼き払う', icon: 'thunder',
      lv: [
        { cd: 2.4, strikes: 1, dmg: 24, aoe: 52 },
        { cd: 2.2, strikes: 1, dmg: 30, aoe: 58 },
        { cd: 2.0, strikes: 2, dmg: 40, aoe: 64 },
        { cd: 1.7, strikes: 2, dmg: 48, aoe: 72 },
        { cd: 1.4, strikes: 3, dmg: 60, aoe: 80 },
      ],
    },
    aura: {
      name: 'ホーリーオーラ', desc: '周囲の敵に継続ダメージを与える聖域', icon: 'aura',
      lv: [
        { radius: 66,  dmg: 5,  tick: 0.5 },
        { radius: 80,  dmg: 7,  tick: 0.5 },
        { radius: 94,  dmg: 9,  tick: 0.45 },
        { radius: 110, dmg: 12, tick: 0.4 },
        { radius: 128, dmg: 16, tick: 0.33 },
      ],
    },
    axe: {
      name: 'スローイングアックス', desc: '放物線を描いて飛ぶ強力な斧', icon: 'axe',
      lv: [
        { cd: 1.7, count: 1, dmg: 20 },
        { cd: 1.6, count: 2, dmg: 24 },
        { cd: 1.5, count: 2, dmg: 32 },
        { cd: 1.3, count: 3, dmg: 38 },
        { cd: 1.1, count: 4, dmg: 50 },
      ],
    },
    wisp: {
      name: 'スピリットウィスプ', desc: '敵を追尾する精霊の炎', icon: 'wisp',
      lv: [
        { cd: 1.9, count: 1, dmg: 13, pierce: 3 },
        { cd: 1.8, count: 2, dmg: 15, pierce: 3 },
        { cd: 1.7, count: 2, dmg: 20, pierce: 4 },
        { cd: 1.5, count: 3, dmg: 25, pierce: 5 },
        { cd: 1.2, count: 4, dmg: 32, pierce: 6 },
      ],
    },
    fire: {
      name: 'ファイアー', desc: '貫通する火炎弾。命中した敵を燃焼させる', icon: 'fire',
      lv: [
        { cd: 1.8, dmg: 8,  count: 1, burn: 4 },
        { cd: 1.7, dmg: 10, count: 1, burn: 6 },
        { cd: 1.6, dmg: 14, count: 2, burn: 8 },
        { cd: 1.4, dmg: 18, count: 2, burn: 11 },
        { cd: 1.2, dmg: 24, count: 3, burn: 15 },
      ],
    },
    blizzard: {
      name: 'ブリザード', desc: '吹雪で敵を切り刻み凍傷を付与する。凍傷はダメージ毎に1スタック(5秒/最大10)、スタック毎に移動速度-4%・攻撃力-2%', icon: 'blizzard',
      lv: [
        { cd: 4.5, dmg: 5,  radius: 70,  dur: 2.5 },
        { cd: 4.2, dmg: 7,  radius: 80,  dur: 3.0 },
        { cd: 3.8, dmg: 9,  radius: 90,  dur: 3.0 },
        { cd: 3.4, dmg: 12, radius: 105, dur: 3.2 },
        { cd: 3.0, dmg: 16, radius: 120, dur: 3.5 },
      ],
    },
    bhole: {
      name: 'ブラックホール', desc: '重力弾の着弾点に特異点を生成。敵を吸引し0.1秒毎にダメージ', icon: 'bhole',
      lv: [
        { cd: 6.0, dmg: 5,  dur: 0.5, radius: 90,  pull: 240 },
        { cd: 5.6, dmg: 6,  dur: 0.6, radius: 100, pull: 260 },
        { cd: 5.2, dmg: 8,  dur: 0.7, radius: 110, pull: 280 },
        { cd: 4.8, dmg: 10, dur: 0.8, radius: 120, pull: 300 },
        { cd: 4.2, dmg: 13, dur: 1.0, radius: 130, pull: 330 },
      ],
    },
    katana: {
      name: '刀', desc: '最も近い敵へ素早い斬撃を放つ', icon: 'katana',
      lv: [
        { cd: 1.0,  dmg: 16, count: 1, aoe: 105 },
        { cd: 0.9,  dmg: 22, count: 1, aoe: 113 },
        { cd: 0.85, dmg: 26, count: 2, aoe: 122 },
        { cd: 0.8,  dmg: 32, count: 2, aoe: 132 },
        { cd: 0.7,  dmg: 40, count: 3, aoe: 146 },
      ],
    },
  },

  // 武器ステータス差分表示用の日本語ラベル
  statLabels: {
    cd: 'CD', dmg: '威力', count: '数', speed: '弾速', pierce: '貫通',
    strikes: '落雷数', aoe: '範囲', radius: '半径', rot: '回転', tick: '間隔',
    burn: '燃焼/s', dur: '持続', pull: '吸引力',
  },

  // ---------- パッシブ(最大Lv5) ----------
  passives: {
    boots:  { name: 'ラピッドブーツ',     desc: '移動速度 +10%',            icon: 'boots' },
    power:  { name: 'パワークリスタル',   desc: '攻撃力 +12%',              icon: 'power' },
    heart:  { name: 'いのちの器',         desc: '最大HP +20 / HP20回復',    icon: 'heart' },
    magnet: { name: 'マグネット',         desc: 'ジェム吸引範囲 +40%',      icon: 'magnet' },
    tome:   { name: '古の魔導書',         desc: 'クールダウン -7%',         icon: 'tome' },
    lens:   { name: '幸運のクローバー',   desc: 'クリティカル率 +7%',       icon: 'lens' },
    area:   { name: '拡がりの宝珠',       desc: '攻撃範囲 +12%',            icon: 'area' },
    regen:  { name: '再生の指輪',         desc: '毎秒HP 0.6 自動回復',      icon: 'regen' },
    range:  { name: 'ロングスコープ',     desc: '弾の射程 +10%',            icon: 'range' },
    size:   { name: 'ジャイアントリング', desc: '弾のサイズ +20%(ボルト/ブレード/アックス/ウィスプ/ファイアー)', icon: 'size' },
  },

  // ---------- アーティファクト(ボス撃破ドロップ・レベルなし・ゲームチェンジャー) ----------
  artifacts: {
    wslot:     { name: '拡張ホルスター',   desc: '武器の装備枠が 1 つ増える' },
    pslot:     { name: '秘伝の腰袋',       desc: 'パッシブの装備枠が 1 つ増える' },
    chain:     { name: '連鎖の雷核',       desc: 'サンダーの落雷ダメージ -20%・攻撃範囲 -20%。落雷が近くの敵へ次々に連鎖する(連鎖数 = 落雷数)' },
    frenzy:    { name: '狂戦士の血晶',     desc: 'パワークリスタルの効力が現在HPに比例して変化する(HP満タンで150%・瀕死で0%)' },
    clock:     { name: '狂気の懐中時計',   desc: '古の魔導書とラピッドブーツの効力 +30%。しかし敵の出現率と移動速度 +15%' },
    fireburst: { name: '爆裂の火薬庫',     desc: 'ファイアーが着弾時に爆発し範囲ダメージ(威力60%)を与える。射程 -25%' },
    bleed:     { name: '渇血の棘',         desc: '刀・オービットブレード・スローイングアックスが出血(5秒)を付与。出血スタック 1 につき受けるダメージ +5%(最大スタックは対象武器の所持数に応じて 6/9/12)' },
    holyleech: { name: '聖杯の加護',       desc: 'ホーリーオーラがダメージを与えるたびHPを 1% 回復する' },
    wisphunter:{ name: '狩猟の精霊石',     desc: 'スピリットウィスプが同じ敵に再度ヒットするようになる(当たり判定を抜けるとリセット)。ダメージ -15%・射程 -15%・追尾能力 -15%' },
    blizzwalk: { name: '吹雪の羅針盤',     desc: 'ブリザードがプレイヤーへ徐々に移動するようになる。凍傷の最大スタック +5・凍傷スタック毎に被ダメージ +1%。範囲 -15%・持続 -15%' },
    mirror:    { name: '双面の魔鏡',       desc: 'マジックボルトが反対方向にも同時発射される。ダメージ -25%' },
    critdmg:   { name: '処刑人の刻印',     desc: 'クリティカルダメージ +25%' },
    pact:      { name: '悪魔の契約書',     desc: '獲得経験値 +50%。しかし敵のステータス(HP・速度・攻撃力) +15%' },
    horizon:   { name: '事象の地平線',     desc: 'ブラックホールの CD +15%・ダメージ -55%・持続時間 +100%。吸引した敵 1 体につき範囲 +5%(最大 +100%)。範囲内の敵の攻撃力 -50%' },
    amp:       { name: '増幅の魔石',       desc: 'マグネット・拡がりの宝珠・ロングスコープ・ジャイアントリングの効力 +50%。パワークリスタル・幸運のクローバーの効力 -15%' },
    dice:      { name: '賭博師のダイス',   desc: '幸運のクローバーの効力 -25%。敵撃破コンボ 1 につき効力 +1%' },
    aegis:     { name: '不動の重鎧',       desc: '移動速度 -40%。いのちの器と再生の指輪の効力 +100%' },
  },

  // ---------- ステージ配色 ----------
  palettes: [
    { label: 'はじまりの草原', bg: '#2c4a33', decoA: '#3a5d40', decoB: '#24402b', accent: '#7fb069', flower: '#e4e98a', amb: '#9fd86a', rise: false },
    { label: '黄昏の荒野',     bg: '#2a2440', decoA: '#383055', decoB: '#221d36', accent: '#8b7ec8', flower: '#e0c3fc', amb: '#b7a7f0', rise: false },
    { label: '灼熱の奈落',     bg: '#3c1f1c', decoA: '#512a24', decoB: '#2e1714', accent: '#a23e3e', flower: '#ffb347', amb: '#ff9b3d', rise: true },
  ],
};
