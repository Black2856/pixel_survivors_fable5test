// sprites-extra.js — 追加コンテンツ用スプライト(sprites.js の後に読み込むこと)
// 新武器(fire/blizzard)・新パッシブ(area/regen)のアイコンとアーティファクト宝珠を SPRITES に追記する
(function () {
  'use strict';
  if (!window.SPRITES) { console.error('[SPRITES-EXTRA] SPRITES not found'); return; }

  function px(pal, rows) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const col = pal[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    });
    return c;
  }

  const O = '#181025';

  // ── アイコン: ファイアー(炎) 12x12 ──
  const ipF = { O, r: '#ff5a2a', y: '#ffb13d', w: '#fff3c4' };
  const ioFire = [
    '.....O......',
    '....OrO.....',
    '....OrO.....',
    '...OrryO....',
    '...OryyO....',
    '..OrryyrO...',
    '..OryywrO...',
    '.OryywwyrO..',
    '.OrywwwyrO..',
    '..OyywwyO...',
    '...OyyyO....',
    '....OOO.....',
  ];

  // ── アイコン: ブリザード(雪結晶) 12x12 ──
  const ipB = { O, c: '#9fdcff', C: '#d9f2ff', w: '#ffffff' };
  const ioBliz = [
    '.....cc.....',
    '..c..cc..c..',
    '...c.cc.c...',
    '....cccc....',
    '.cccCwwCccc.',
    '.cccCwwCccc.',
    '....cccc....',
    '...c.cc.c...',
    '..c..cc..c..',
    '.....cc.....',
    '............',
    '............',
  ];

  // ── アイコン: 拡がりの宝珠(攻撃範囲) 12x12 ──
  const ipA = { O, g: '#7cfc8a', y: '#ffd23f' };
  const ioArea = [
    '............',
    '....OOOO....',
    '..OOg..gOO..',
    '..Og....gO..',
    '.Og..OO..gO.',
    '.O..OyyO..O.',
    '.O..OyyO..O.',
    '.Og..OO..gO.',
    '..Og....gO..',
    '..OOg..gOO..',
    '....OOOO....',
    '............',
  ];

  // ── アイコン: 再生の指輪(回復十字) 12x12 ──
  const ipR = { O, g: '#5ee05e', w: '#d2ffd9' };
  const ioRegen = [
    '............',
    '....OOOO....',
    '....OggO....',
    '....OggO....',
    '.OOOOggOOOO.',
    '.OgggwwgggO.',
    '.OgggwwgggO.',
    '.OOOOggOOOO.',
    '....OggO....',
    '....OggO....',
    '....OOOO....',
    '............',
  ];

  // ── 弾: 火炎弾 8x8 2フレーム ──
  const fpP = { O, r: '#ff5a2a', y: '#ffb13d', w: '#fff3c4' };
  const ff0 = [
    '...OO...',
    '..OrrO..',
    '.OryyrO.',
    'OryywwrO',
    'OryywwrO',
    '.OryyrO.',
    '..OrrO..',
    '...OO...',
  ];
  const ff1 = [
    '...OO...',
    '..OyyO..',
    '.OyrwyO.',
    'OyrwwyrO',
    'OyrwwyrO',
    '.OyrwyO.',
    '..OyyO..',
    '...OO...',
  ];

  // ── アイテム: アーティファクト宝珠 10x12 2フレーム ──
  const apP = { O, p: '#b06ef0', m: '#7a3fd0', w: '#ffffff', g: '#ffd23f' };
  const af0 = [
    '...OOOO...',
    '..OppmpO..',
    '.OpmwwmpO.',
    '.OpwwmmpO.',
    '.OpmmmmpO.',
    '.OpmpppmO.',
    '..OpmmpO..',
    '...OOOO...',
    '....OO....',
    '..OOggOO..',
    '.OggggggO.',
    '.OOOOOOOO.',
  ];
  const af1 = [
    '...OOOO...',
    '..OpmppO..',
    '.OpmmmmpO.',
    '.OpmmwwpO.',
    '.OpmwwmpO.',
    '.OpmpppmO.',
    '..OpmmpO..',
    '...OOOO...',
    '....OO....',
    '..OOggOO..',
    '.OggggggO.',
    '.OOOOOOOO.',
  ];

  // ── アイコン: ロングスコープ(射程・右向き矢印) 12x12 ──
  const ipRg = { O, y: '#ffd23f', w: '#ffffff' };
  const ioRange = [
    '............',
    '............',
    '........O...',
    '........OO..',
    '.OOOOOOOOyO.',
    '.OyyyyyyyywO',
    '.OOOOOOOOyO.',
    '........OO..',
    '........O...',
    '............',
    '............',
    '............',
  ];

  // ── アイコン: ジャイアントリング(サイズ・拡大) 12x12 ──
  const ipSz = { O, g: '#ff9b3d', w: '#ffffff' };
  const ioSize = [
    'ww........ww',
    'w..........w',
    '....OOOO....',
    '...OOggOO...',
    '..OOggggOO..',
    '..OgggggwO..',
    '..OggggwwO..',
    '..OOggggOO..',
    '...OOggOO...',
    '....OOOO....',
    'w..........w',
    'ww........ww',
  ];

  // ── アイコン: ブラックホール(暗黒の渦) 12x12 ──
  const ipBh = { O, p: '#b06ef0', m: '#7a3fd0', k: '#0a0614', w: '#ffffff' };
  const ioBh = [
    '............',
    '....pppp....',
    '..pp.w..pp..',
    '.p..mmmm..p.',
    '.p.mkkkkm.p.',
    '.pmkkkkkkmp.',
    '.pmkkkkkkmp.',
    '.p.mkkkkm.p.',
    '.p..mmmm..p.',
    '..pp..w.pp..',
    '....pppp....',
    '............',
  ];

  // ── アイコン: 刀(斜めの刃) 12x12 ──
  const ipKa = { O, w: '#e8f4ff', s: '#9fb8d8', g: '#ffd23f', h: '#7a4a2a' };
  const ioKatana = [
    '.........OO.',
    '........OwwO',
    '.......OwsO.',
    '......OwsO..',
    '.....OwsO...',
    '....OwsO....',
    '...OwsO.....',
    '.OOOwO......',
    '.OggO.......',
    '..OhOO......',
    '.OhO........',
    '.OO.........',
  ];

  // ── アイコン: スキップ(ダイス・ランダム強化) 12x12 ──
  const ipSk = { O, w: '#f0f0f8', d: '#23233a', s: '#c8c8dc' };
  const ioSkip = [
    '............',
    '.OOOOOOOOOO.',
    '.OwwwwwwwwO.',
    '.OwdwwwwdwO.',
    '.OwwwwwwwwO.',
    '.OwwwddwwwO.',
    '.OwwwddwwwO.',
    '.OwwwwwwwwO.',
    '.OwdwwwwdwO.',
    '.OssssssssO.',
    '.OOOOOOOOOO.',
    '............',
  ];

  // ── 弾: 重力弾 8x8 2フレーム ──
  const bpP = { O, p: '#b06ef0', m: '#7a3fd0', k: '#0a0614', w: '#ffffff' };
  const bf0 = [
    '...OO...',
    '..OppO..',
    '.OpmmpO.',
    'OpmkkwpO',
    'OpwkkmpO',
    '.OpmmpO.',
    '..OppO..',
    '...OO...',
  ];
  const bf1 = [
    '...OO...',
    '..OmpO..',
    '.OmwkpO.',
    'OmkkkmpO',
    'OpmkkkmO',
    '.OpkwmO.',
    '..OpmO..',
    '...OO...',
  ];

  SPRITES.icons.range    = { frames: [px(ipRg, ioRange)], w: 12, h: 12 };
  SPRITES.icons.size     = { frames: [px(ipSz, ioSize)], w: 12, h: 12 };
  SPRITES.icons.fire     = { frames: [px(ipF, ioFire)], w: 12, h: 12 };
  SPRITES.icons.blizzard = { frames: [px(ipB, ioBliz)], w: 12, h: 12 };
  SPRITES.icons.area     = { frames: [px(ipA, ioArea)], w: 12, h: 12 };
  SPRITES.icons.regen    = { frames: [px(ipR, ioRegen)], w: 12, h: 12 };
  SPRITES.icons.bhole    = { frames: [px(ipBh, ioBh)], w: 12, h: 12 };
  SPRITES.icons.katana   = { frames: [px(ipKa, ioKatana)], w: 12, h: 12 };
  SPRITES.icons.skip     = { frames: [px(ipSk, ioSkip)], w: 12, h: 12 };
  SPRITES.proj.fire      = { frames: [px(fpP, ff0), px(fpP, ff1)], w: 8, h: 8 };
  SPRITES.proj.bhole     = { frames: [px(bpP, bf0), px(bpP, bf1)], w: 8, h: 8 };
  SPRITES.items.artifact = { frames: [px(apP, af0), px(apP, af1)], w: 10, h: 12 };
})();
