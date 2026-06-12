// export-items.js — js/data.js からアイテムリスト(items.csv)を生成する
// 使い方: node scripts/export-items.js
// バランス調整で data.js を変更したら再実行すれば CSV が最新化される。
'use strict';

const fs = require('fs');
const path = require('path');

// data.js は classic script なので Function でラップして DATA を取り出す
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const DATA = new Function(src + '; return DATA;')();

const HEADER = ['カテゴリ', 'ID', '名称', 'レベル', '説明',
  'CD(秒)', '威力', '数', '弾速', '貫通', '落雷数', '範囲', '半径', '回転速度', '間隔(秒)',
  '燃焼DPS', '持続(秒)', '速度倍率', '吸引力'];

const rows = [HEADER];
const cell = v => (v === undefined || v === null) ? '' : String(v);
const q = v => `"${cell(v).replace(/"/g, '""')}"`;

// ---------- 武器(レベル別ステータス) ----------
for (const key in DATA.weapons) {
  const w = DATA.weapons[key];
  w.lv.forEach((st, i) => {
    rows.push(['武器', key, w.name, i + 1, w.desc,
      st.cd, st.dmg, st.count, st.speed, st.pierce,
      st.strikes, st.aoe, st.radius, st.rot, st.tick,
      st.burn, st.dur, st.slow, st.pull]);
  });
}

// ---------- パッシブ(累積効果。計算式は game.js の recalc() と一致させること) ----------
const passiveFx = {
  boots:  n => `移動速度 +${10 * n}%`,
  power:  n => `攻撃力 +${12 * n}%`,
  heart:  n => `最大HP +${20 * n}(取得時HP20回復)`,
  magnet: n => `ジェム吸引範囲 +${40 * n}%`,
  tome:   n => `クールダウン -${((1 - Math.pow(0.93, n)) * 100).toFixed(1)}%`,
  lens:   n => `クリティカル率 ${5 + 7 * n}%(基礎5%込み)`,
  area:   n => `攻撃範囲 +${12 * n}%`,
  regen:  n => `毎秒HP ${(0.6 * n).toFixed(1)} 自動回復`,
  range:  n => `弾の射程 +${10 * n}%`,
  size:   n => `弾のサイズ +${20 * n}%(ボルト/ブレード/アックス/ウィスプ/ファイアー)`,
};
for (const key in DATA.passives) {
  const p = DATA.passives[key];
  for (let n = 1; n <= 5; n++) {
    rows.push(['パッシブ', key, p.name, n, passiveFx[key] ? passiveFx[key](n) : p.desc]);
  }
}

// ---------- ドロップアイテム(数値は game.js の実装値) ----------
const dropRows = [
  ['ドロップ', 'gemS',   'ジェム(小)', '', '経験値1〜2。ザコ敵がドロップ'],
  ['ドロップ', 'gemM',   'ジェム(中)', '', '経験値3〜14。ゴースト・インプ・ブルートなどがドロップ'],
  ['ドロップ', 'gemL',   'ジェム(大)', '', '経験値15以上。エリート(25)・ボス撃破時(20×14個)'],
  ['ドロップ', 'heart',  'ハート',     '', 'HP30回復。通常敵1.2%・ボス撃破時確定ドロップ'],
  ['ドロップ', 'magnet', 'マグネット', '', '画面内の全ジェムを吸引。通常敵0.4%・ボス撃破時確定ドロップ'],
  ['ドロップ', 'chest',  '宝箱',       '', '所持武器をランダムに1レベル強化(全武器Lv5ならHP50回復)。エリート撃破で確定ドロップ'],
];
rows.push(...dropRows);

// ---------- アーティファクト(ボス撃破ドロップ・レベルなし) ----------
for (const key in DATA.artifacts) {
  const a = DATA.artifacts[key];
  rows.push(['アーティファクト', key, a.name, '', a.desc + '(ボス撃破ドロップの宝珠で未所持3択+スキップから選択)']);
}

const csv = rows.map(r => {
  const padded = [...r];
  while (padded.length < HEADER.length) padded.push('');
  return padded.map(q).join(',');
}).join('\r\n');

const out = path.join(__dirname, '..', 'items.csv');
fs.writeFileSync(out, '﻿' + csv + '\r\n', 'utf8'); // BOM付き=Excelで文字化けしない
console.log(`OK: ${out} (${rows.length - 1} 行)`);
