// sprites.js — procedurally generated pixel-art sprites for Fable5 game
// All sprites are HTMLCanvasElements at native art resolution (no pre-scaling).
// The game scales them up at draw time with imageSmoothingEnabled = false.

window.SPRITES = (function () {
  'use strict';

  // ── Core helper ──────────────────────────────────────────────────────────────
  // px(palette, rows) → HTMLCanvasElement
  // rows: array of equal-length strings; each char is a palette key.
  // '.' and ' ' mean transparent.
  function px(palette, rows) {
    var h = rows.length;
    // Use the maximum row length so off-by-one padding differences are harmless
    var w = 0;
    for (var i = 0; i < h; i++) { if (rows[i].length > w) w = rows[i].length; }
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < h; y++) {
      var row = rows[y];
      for (var x = 0; x < row.length; x++) {
        var ch = row[x];
        if (!ch || ch === '.' || ch === ' ') continue;
        ctx.fillStyle = palette[ch] || 'rgba(0,0,0,0)';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return canvas;
  }

  var K = '#181025'; // near-black outline used everywhere

  // ── PLAYER  16x16  4 walk frames ─────────────────────────────────────────────
  var pP = {
    K: K,
    S: '#f0c090', // skin
    B: '#2266cc', // blue body
    b: '#5599ff', // highlight blue
    D: '#114499', // dark blue
    G: '#ffffaa', // glow yellow
    g: '#ffee44', // bright glow
    R: '#cc3322', // red gem
    W: '#dddddd', // white
    H: '#8866aa', // purple hair
    T: '#c8a060', // tan/leather
  };

  // frame 0 – idle / walk neutral
  var pF0 = [
    '....KKKK........',
    '...KHHhHK.......',
    '..KHHhHHhK......',
    '..KSSSSSSdK.....',
    '..KSRSSSSdK.....',
    '...KKKKKKK......',
    '..KBBBBBBKKKg...',
    '.KDBbBbBBKGgGK..',
    '.KDBBBbBBKgGgK..',
    '.KDBbBbBBKKKg...',
    '..KDDDDBbK......',
    '..KTTTTTTdK.....',
    '..KTBbBTTdK.....',
    '..KTK..KTdK.....',
    '.KWK....KWK.....',
    'KWK......KWK....',
  ];
  // frame 1 – right leg forward
  var pF1 = [
    '....KKKK........',
    '...KHHhHK.......',
    '..KHHhHHhK......',
    '..KSSSSSSdK.....',
    '..KSRSSSSdK.....',
    '...KKKKKKK......',
    '..KBBBBBBKKKg...',
    '.KDBbBbBBKGgGK..',
    '.KDBBBbBBKgGgK..',
    '.KDBbBbBBKKKg...',
    '..KDDDDBbK......',
    '..KTTTTTTdK.....',
    '..KTBbBTTdK.....',
    '.KWK..KTdK......',
    'KWK....KTdK.....',
    '........KWK.....',
  ];
  // frame 2 – neutral (slight bob)
  var pF2 = [
    '....KKKK........',
    '...KHhHHK.......',
    '..KHhHHHhK......',
    '...KSSSSSdK.....',
    '...KSRSSdK......',
    '...KKKKKKK......',
    '..KBBBBBBKKKg...',
    '.KDBbBbBBKGgGK..',
    '.KDBBBbBBKgGgK..',
    '.KDBbBbBBKKKg...',
    '..KDDDDBbK......',
    '..KTTTTTTdK.....',
    '..KTBbBTTdK.....',
    '..KTK..KTdK.....',
    '.KWK....KWK.....',
    'KWK......KWK....',
  ];
  // frame 3 – left leg forward
  var pF3 = [
    '....KKKK........',
    '...KHHhHK.......',
    '..KHHhHHhK......',
    '..KSSSSSSdK.....',
    '..KSRSSSSdK.....',
    '...KKKKKKK......',
    '..KBBBBBBKKKg...',
    '.KDBbBbBBKGgGK..',
    '.KDBBBbBBKgGgK..',
    '.KDBbBbBBKKKg...',
    '..KDDDDBbK......',
    '..KTTTTTTdK.....',
    '..KTBbBTTdK.....',
    '..KTTdKWK.......',
    '..KTdK.KWK......',
    '.KWK....KWK.....',
  ];

  var playerFrames = [pF0, pF1, pF2, pF3].map(function (r) { return px(pP, r); });

  // ── ZOMBIE  14x16  2 frames ───────────────────────────────────────────────────
  var zP = {
    K: K,
    G: '#5a9a44', // zombie green
    g: '#7acc55',
    d: '#3a6a2a',
    S: '#d4c07a', // pale skin
    R: '#cc2200', // red
    B: '#6655aa', // ragged shirt
    b: '#443388',
    T: '#8b6b3a', // pants
    W: '#cccccc', // teeth
  };
  var zF0 = [
    '..KKKKKKK.....',
    '.KGGGgGGGK....',
    '.KGGGgGGGK....',
    '.KSSSSSSSdK...',
    '.KSRSSSSRdK...',
    '.KSSWWSSSdK...',
    '..KKKKKKdK....',
    'KdKBBBBBBKKKd.',
    'KdKBbBbBBK..Kd',
    '.KKBBBbBBKK...',
    '..KdBBBBdK....',
    '..KTTTTTTdK...',
    '..KTTTTTTdK...',
    '..KTdKKTdK....',
    '.KGK...KGK....',
    'KGK.....KGK...',
  ];
  var zF1 = [
    '..KKKKKKK.....',
    '.KGGGgGGGK....',
    '.KGGGgGGGK....',
    '.KSSSSSSSdK...',
    '.KSRSSSSRdK...',
    '.KSSWWSSSdK...',
    '..KKKKKKdK....',
    '..KBBBBBBKKKd.',
    'KdKBbBbBBK..Kd',
    'KdKBBBbBBKK...',
    '..KdBBBBdK....',
    '..KTTTTTTdK...',
    '..KTTTTTTdK...',
    '.KGK.KTdK.....',
    'KGK...KTK.....',
    '......KGK.....',
  ];

  // ── BAT  12x10  2 frames ──────────────────────────────────────────────────────
  var batP = {
    K: K,
    P: '#7733bb',
    p: '#aa55ee',
    L: '#cc99ff',
    R: '#ff2222',
    W: '#ddaaff',
    w: '#bb88dd',
  };
  var batF0 = [
    '.KKK....KKK.',
    'KPPKKKKKKppK',
    'KWPKpppKpWWK',
    'KWWKKLLKKwwK',
    '.KWKKRRKKwK.',
    '.KWKKKKKKwK.',
    '..KWKKKKwK..',
    '..KWKKKKwK..',
    '...KWKKwK...',
    '....KKKK....',
  ];
  var batF1 = [
    '....KKKK....',
    '...KPPpK....',
    '..KPPLpRK...',
    '.KWKKLLKKwK.',
    'KWK.KRRK.KwK',
    'KWK.KKKK.KwK',
    'KWKKKKKKKKwK',
    '.KWKKKKKKwK.',
    '..KwKKKKwK..',
    '...KKKKKK...',
  ];

  // ── SKELETON  14x16  2 frames ─────────────────────────────────────────────────
  var skP = {
    K: K,
    W: '#e8e4d0',
    w: '#f5f2e8',
    d: '#c0baa0',
    R: '#ee2222',
    Y: '#ddcc88',
  };
  var skF0 = [
    '..KKKKKKKK....',
    '.KWWwWwWWWK...',
    '.KWwWWWwWWK...',
    '.KdWWWWWWdK...',
    '.KdRWWWRdK....',
    '.KdWKKWdK.....',
    '..KKKKKdK.....',
    '..KYYYYYdKKK..',
    '.KdYwYwYK..Kd.',
    '.KdYYYYYKK....',
    '..KdYYYdK.....',
    '..KWWWWWdK....',
    '..KWdWdWdK....',
    '.KdK.KdK......',
    'KWK...KWK.....',
    'KdK...KdK.....',
  ];
  var skF1 = [
    '..KKKKKKKK....',
    '.KWWwWwWWWK...',
    '.KWwWWWwWWK...',
    '.KdWWWWWWdK...',
    '.KdRWWWRdK....',
    '.KdWKKWdK.....',
    '..KKKKKdK.....',
    '..KYYYYYdKKK..',
    'KdKYwYwYK..Kd.',
    'KdKYYYYYKK....',
    '..KdYYYdK.....',
    '..KWWWWWdK....',
    '..KWdWdWdK....',
    '..KWK.KdK.....',
    '..KdK...KWK...',
    '..KWK...KdK...',
  ];

  // ── GHOST  14x14  2 frames ────────────────────────────────────────────────────
  var ghP = {
    K: K,
    C: '#aaeedd',
    c: '#ccffee',
    d: '#557766',
    B: '#000000',
    W: '#eeffff',
    T: '#88bbaa',
  };
  var ghF0 = [
    '...KKKKKKKK...',
    '..KCCccCCCCK..',
    '.KCCcCCCcCCCK.',
    '.KCCCCWCCCCCdK',
    '.KCBCCCCCBCCdK',
    '.KCCCKKCCCCdK.',
    '.KCCCKKCCCCdK.',
    '.KdCCCCCCCCdK.',
    '.KdTTTTTTTTdK.',
    '.KdTdKKKdTdK..',
    '..KdKKKKKdK...',
    '..KTK.KKTdK...',
    '..KdK..KdK....',
    '...KK...KK....',
  ];
  var ghF1 = [
    '...KKKKKKKK...',
    '..KCCccCCCCK..',
    '.KCCcCCCcCCCK.',
    '.KCCCCWCCCCCdK',
    '.KCBCCCCCBCCdK',
    '.KCCCKKCCCCdK.',
    '.KCCCKKCCCCdK.',
    '.KdCCCCCCCCdK.',
    '..KdTTTTTTdK..',
    '..KKdKKKdKK...',
    '.KTK.....KTK..',
    '.KdK.....KdK..',
    '..KK.....KK...',
    '..............',
  ];

  // ── BRUTE  20x20  2 frames ────────────────────────────────────────────────────
  var brP = {
    K: K,
    R: '#9b3a1a',
    r: '#cc5533',
    d: '#6a2010',
    S: '#d4a070',
    s: '#e8b888',
    Y: '#ffcc00',
    B: '#554422',
    b: '#776633',
    G: '#888888',
    W: '#eeeeee',
  };
  var brF0 = [
    '....KKKKKKKKKK......',
    '...KRRrRRRRRRRK.....',
    '..KRRrRRsRRRRRRK....',
    '.KKRRRRRRRRRRRRdK...',
    'KdKRYRRRRRRYRRdK....',
    'KdKRRRRRRRRRRRdK....',
    'KdKRRWWRRWWRRRdK....',
    '.KKRRRKKRRKKRRdK....',
    '..KdRRRRRRRRRddK....',
    '.KdKRRRRRRRRRRdKKK..',
    'KdKRrRrRRrRrRRK..Kd.',
    'KdKRRRRRRRRRRRKK....',
    '.KKRRRRRRRRRRdK.....',
    '.KdKBBBBBBBBdK......',
    '.KdKBbBbBbBBdK......',
    '.KdKBBBBBBBBdK......',
    '..KdKBbBBBbdK.......',
    '..KdKBBKKBBdK.......',
    '..KBK..KKBbK........',
    '.KBK....KKBbK.......',
  ];
  var brF1 = [
    '....KKKKKKKKKK......',
    '...KRRrRRRRRRRK.....',
    '..KRRrRRsRRRRRRK....',
    '.KKRRRRRRRRRRRRdK...',
    'KdKRYRRRRRRYRRdK....',
    'KdKRRRRRRRRRRRdK....',
    'KdKRRWWRRWWRRRdK....',
    '.KKRRRKKRRKKRRdK....',
    '..KdRRRRRRRRRddK....',
    '..KdRRRRRRRRRRdKKK..',
    '.KdKRrRrRRrRrRRK..Kd',
    'KdKRRRRRRRRRRRKK....',
    'KdKRRRRRRRRRRdK.....',
    '.KKBBBBBBBBBBdK.....',
    '.KdKBbBbBbBBdK......',
    '.KdKBBBBBBBBdK......',
    '..KdKBBKKBBdK.......',
    '..KdK..KdKBdK.......',
    '..KBK..KBK..........',
    '.KBK....KBK.........',
  ];

  // ── IMP  12x12  2 frames ──────────────────────────────────────────────────────
  var impP = {
    K: K,
    O: '#dd6600',
    o: '#ff9922',
    R: '#cc2200',
    r: '#ff4400',
    Y: '#ffee00',
    d: '#882200',
    W: '#ffffff',
    H: '#990000',
  };
  var impF0 = [
    '..HK..KH....',
    '.KHHK.KHK...',
    '..KKdKdKK...',
    '..KOoOoOK...',
    '.KROoYoORK..',
    '.KROoOoORK..',
    '.KdOWWWOdK..',
    '..KKKKKKdK..',
    '.KdOOOOOdK..',
    'KdKoRoRoRdKK',
    'KdKOOOOOOdKT',
    '.KdKKKKKdK..',
  ];
  var impF1 = [
    '...HK.KH....',
    '..KHHKKHK...',
    '...KKdKKK...',
    '..KOoOoOK...',
    '.KROoYoORK..',
    '.KROoOoORK..',
    '.KdOWWWOdK..',
    '..KKKKKKdK..',
    '.KdOOOOOdK..',
    '.KdoRoROdK..',
    'KdKOOOOOdKKT',
    '.KdKKKKKdK..',
  ];

  // ── BOSS: KING  36x36  2 frames ───────────────────────────────────────────────
  // All rows padded/trimmed to exactly 36 chars.
  var kgP = {
    K: K,
    G: '#5a9a44',
    g: '#7acc55',
    d: '#3a6a2a',
    S: '#d4c07a',
    Y: '#ffcc00',
    y: '#ffee88',
    R: '#cc2200',
    P: '#aa33cc',
    p: '#cc66ee',
    B: '#443399',
    b: '#6655bb',
    W: '#dddddd',
    C: '#993322',
    e: '#ff4444',
    T: '#8b6b3a',
    t: '#aa8855',
  };
  var kgF0 = [
    '.........KYYYYYYYYYYYK..........',  // 33 -> pad to 36
    '........KYyYyYyYyYyYyYK.........',
    '.......KYYYyYYYYyYYYYYYK........',
    '......KYyYYYKKKKKYYyYYYyK.......',
    '.....KKKKKKKGGGGGGGKKKKKKKK.....',
    '....KGGGgGGGGGGGGGGGGGGGGGGK....',
    '....KGGGgGGGGGGGGGGGGGGGGGGK....',
    '...KdGGGGGGSSSSSSSSGGGGGGGGdK...',
    '...KdGGGGGSSSSSSSSSSGGGGGGGdK...',
    '...KdGGGGSSSSSSSSSSSGGGGGGGdK...',
    '..KdGGGGGSeSSSSSSeSGGGGGGGGdK...',
    '..KdGGGGGSSSSSSSSSSGGGGGGGGdK...',
    '..KdGGGGSSSWWSSSWWSSGGGGGGGdK...',
    '..KKKKKKKKSSSSSSSSSSKKKKKKKKK...',
    '.KPPPpPpPPKBBBBBBBBBKpPPpPPPPK.',
    'KPPPpPpPPPKBbBbBbBbBKPPpPpPPPPK',
    'KPPPpPpPPPKBBBBBBBBBKPPpPpPPPPK',
    'KdPPPpPpPPKBBBBBBBBBKPPpPpPPPdK',
    'KdPPPpPpPPKBBBBBBBBBKPPpPpPPPdK',
    'KdPPPKKKKKKKKKKKKKKKKKKKKKPPPdK',
    'KdPPPKCCCCCCCCCCCCCCCCCCCCPPPdK',
    'KdPPPKCcCcCcCcCcCcCcCcCcCCPPPdK',
    'KdPPPKCCCCCCCCCCCCCCCCCCCCPPPdK',
    '.KPPPKKKKKKKKKKKKKKKKKKKKKPPPK.',
    '..KPPPPPKTTTTTTTTTTTTTKPPPPPK..',
    '...KPpPPKTTTTTTTTTTTTTKPpPPK...',
    '...KPpPPKTTtTtTtTtTTTTKPpPPK...',
    '....KPPKKTtTtTtTtTtTTKKPPPK....',
    '....KPPKdKKKTTTTTKKKdKKPPK.....',
    '.....KKdK..KTTTTTK..KdKKK......',
    '.......KdK.KTTTTTK.KdK..........',
    '........KdKKTTTTTKKdK...........',
    '.........KdKKTTTKKdK............',
    '..........KdKKTKKdK.............',
    '...........KdKKKdK..............',
    '............KKKKK...............',
  ];
  var kgF1 = [
    '.........KYYYYYYYYYYYK..........',
    '........KYyYyYyYyYyYyYK.........',
    '.......KYYYyYYYYyYYYYYYK........',
    '......KYyYYYKKKKKYYyYYYyK.......',
    '.....KKKKKKKGGGGGGGKKKKKKKK.....',
    '....KGGGgGGGGGGGGGGGGGGGGGGK....',
    '....KGGGgGGGGGGGGGGGGGGGGGGK....',
    '...KdGGGGGGSSSSSSSSGGGGGGGGdK...',
    '...KdGGGGGSSSSSSSSSSGGGGGGGdK...',
    '...KdGGGGSSSSSSSSSSSGGGGGGGdK...',
    '..KdGGGGGSeSSSSSSeSGGGGGGGGdK...',
    '..KdGGGGGSSSSSSSSSSGGGGGGGGdK...',
    '..KdGGGGSSSWWSSSWWSSGGGGGGGdK...',
    '..KKKKKKKKSSSSSSSSSSKKKKKKKKK...',
    '.KPPPpPpPPKBBBBBBBBBKpPPpPPPPK.',
    'KPPPpPpPPPKBbBbBbBbBKPPpPpPPPPK',
    'KPPPpPpPPPKBBBBBBBBBKPPpPpPPPPK',
    'KdPPPpPpPPKBBBBBBBBBKPPpPpPPPdK',
    'KdPPPpPpPPKBBBBBBBBBKPPpPpPPPdK',
    'KdPPPKKKKKKKKKKKKKKKKKKKKKPPPdK',
    'KdPPPKCCCCCCCCCCCCCCCCCCCCPPPdK',
    'KdPPPKCcCcCcCcCcCcCcCcCcCCPPPdK',
    'KdPPPKCCCCCCCCCCCCCCCCCCCCPPPdK',
    '.KPPPKKKKKKKKKKKKKKKKKKKKKPPPK.',
    '..KPPPPPKTTTTTTTTTTTTTKPPPPPK..',
    '...KPpPPKTTTTTTTTTTTTTKPpPPK...',
    '...KPpPPKTTtTtTtTtTTTTKPpPPK...',
    '....KPPKKTtTtTtTtTtTTKKPPPK....',
    '.....KKK.KdKTTTTTKdK.KKK.......',
    '.........KdKKTTTKKdK............',
    '..........KdK.KdK.KdK...........',
    '..........KdKKTTTKKdK...........',
    '...........KdKKTKKdK............',
    '............KdKKKdK.............',
    '.............KdKdK..............',
    '..............KKK...............',
  ];

  // ── BOSS: WYRM  44x28  2 frames ──────────────────────────────────────────────
  // Art resolution 44 wide x 28 tall. Bone dragon facing right.
  var wyP = {
    K: K,
    W: '#e8e4d0',
    w: '#f5f2e8',
    d: '#c0baa0',
    Y: '#ffcc00',
    R: '#cc4422',
    r: '#ff6644',
    G: '#888888',
    B: '#aaaacc',
  };
  var wyF0 = [
    '............KKKK................................',
    '..........KWWWwWWK..............................',
    '.........KWWwWWWwWK.............................',
    '........KWWWwWWWwWWK...KKKKK....................',
    '.......KdWWWWwYWwWWKKKWWWwWWK...................',
    '......KdWWWWwWWWWWWWWWWwWWWWWK..................',
    '.....KdWWWKKKWWWWWWWWWWWWwWWWWK.................',
    '....KdWWWKRRKWWWwWWwWWWWWWWWwWWK...............',
    '...KdWWWKRrRKWWWWWWwWWWWWWWWWWWWK..............',
    '..KdWWWKKKKKWWWwWWWWwWWWWWWWwWWWWK.............',
    '.KdWWWWWWWWWWWWWWwWWWWWWwWWWWWWWWWK............',
    'KdWWWWwWWWWWWWWWWWWwWWWWWWwWWWWWWWWK...........',
    'KdWWWWWWWwWWWWWWWWWWWWwWWWWWWWwWWWWWK..........',
    '.KdWWWwWWWWWWWWWWwWWWWWWWWwWWWWWWWWWWK.........',
    '..KdWWWWWWwWWWWWWWWWwWWWWWWWwWWWWWWWWK.........',
    '...KdWwWWWWWWwWWWWWWWWWwWWWWWWWWwWWWK..........',
    '...KKdWWWWWWWWWWWwWWWWWWWWwWWWWWWWWK...........',
    '....KKdWWwWWWWWWWWWWWwWWWWWWWWwWWWK............',
    '.....KKdWWWWwWWWWWWWWWWWWwWWWWWWWK.............',
    '......KKdWWWWWWwWWWWWWWWWWWwWWWWK..............',
    '.......KKdWwWWWWWWwWWWWWWWWWWWWK...............',
    '........KKdWWWWWWWWWWwWWWWWWWWK................',
    '.........KKdWWwWWWWWWWWWWwWWWK.................',
    '..........KKdWWWWWwWWWWWWWWWK..................',
    '...........KKdWWWWWWWWwWWWK....................',
    '............KKdWWWWWWWWWK.......................',
    '.............KKdWwWWWWK........................',
    '..............KKKKKKKK..........................',
  ];
  var wyF1 = [
    '.............KKKK...............................',
    '...........KWWWwWWK.............................',
    '..........KWWwWWWwWK............................',
    '.........KWWWwWWWwWWK...KKKKK...................',
    '........KdWWWWwYWwWWKKKWWWwWWK..................',
    '.......KdWWWWwWWWWWWWWWWWwWWWWWK................',
    '......KdWWWKKKWWWWWWWWWWWWwWWWWK................',
    '.....KdWWWKRRKWWWwWWwWWWWWWWWwWWK..............',
    '....KdWWWKRrRKWWWWWWwWWWWWWWWWWWWK.............',
    '...KdWWWKKKKKWWWwWWWWwWWWWWWWwWWWWK............',
    '..KdWWWWWWWWWWWWWWwWWWWWWwWWWWWWWWWK...........',
    '.KdWWWWwWWWWWWWWWWWWwWWWWWWwWWWWWWWWK..........',
    'KdWWWWWWWwWWWWWWWWWWWWwWWWWWWWwWWWWWK..........',
    'KdWWWwWWWWWWWWWWwWWWWWWWWWwWWWWWWWWWWK.........',
    '.KdWWWWWWwWWWWWWWWWwWWWWWWWwWWWWWWWWWK.........',
    '..KdWwWWWWWWwWWWWWWWWWwWWWWWWWWwWWWWK..........',
    '..KKdWWWWWWWWWWWwWWWWWWWWwWWWWWWWWWK...........',
    '...KKdWWwWWWWWWWWWWWwWWWWWWWWwWWWWK............',
    '....KKdWWWWwWWWWWWWWWWWWwWWWWWWWWK.............',
    '.....KKdWWWWWWwWWWWWWWWWWWwWWWWWK..............',
    '......KKdWwWWWWWWwWWWWWWWWWWWWWK...............',
    '.......KKdWWWWWWWWWWwWWWWWWWWWK................',
    '........KKdWWwWWWWWWWWWWwWWWK...................',
    '.........KKdWWWWWwWWWWWWWWWK....................',
    '..........KKdWWWWWWWWwWWWK......................',
    '...........KKdWWWWWWWWWK........................',
    '............KKdWwWWWWK..........................',
    '.............KKKKKKKK...........................',
  ];

  // ── BOSS: REAPER  32x40  2 frames ────────────────────────────────────────────
  // Death figure: black cloak, cyan eyes, scythe handle + blade.
  var reP = {
    K: K,
    D: '#111122',
    d: '#222244',
    C: '#88aaff',
    c: '#aaccff',
    G: '#bbbbbb',
    g: '#dddddd',
    S: '#888899',
    Y: '#ffcc00',
    W: '#ffffff',
    P: '#555577',
    r: '#cc2244',
  };
  var reF0 = [
    '..........KKKKKKKKKK............',
    '.........KDDDdDDDDDDK...........',
    '........KDDDdDdDDDDDDK..........',
    '.......KDDdDDDDdDDDDDDK.........',
    '.....KKDDDDDDDDDDDDDDDDkK.......',
    '....KDDDDDdDDDDDDDdDDDDDDK......',
    '...KDDDDDDDDDDDDDDDDDDDDDDK.....',
    '..KDDDDDDDDDDDDDDDDDDDDDDDDK....',
    '..KDDDDDDDKCCccCCKDDDDDDDDDK...',
    '..KDDDDDDDKccCCccKDDDDDDDDDK...',
    '..KDDDDDDDKKKKKKKDDDDDDDDDdK...',
    '..KDDDDDDDDdDDdDDDDDDDDDDDDK...',
    '..KDDDDDDDDDDDDDDDDDDDDDDDdK...',
    '...KKDDDDDDDDDDDDDDDDDDDDkK....',
    '...KSKDDDDDDDDDDDDDDDDDdKSK....',
    '..KSSKKDDDDDDDDDDDDDDDKKSSdK...',
    '.KSSSKKDDDDDDDDDDDDDDKKSSSSKK..',
    'KSSSSSKKDDDDDDDDDDDDKKSSSSSSK..',
    'KSSSSSSKKDDDDDDDDDDKKSSSSSSSK..',
    'KSSSSSSSSKDDDDDDDDKSSSSSSSSSSK.',
    '.KGGggGGGGKDDDDDKGGGGgGGGGGK..',
    '..KGGGgGGGGKDDDKGGGGGGgGGGK...',
    '...KGGGGgGGGKDKGGGGGgGGGGK....',
    '....KGGGGGGGGKGGGGGGGGGGK.....',
    '.....KYGGGGGGGGGGGGGGGYK.......',
    '......KYYGGGGGGGGGGYYK.........',
    '.......KYYYYYYYYYYYYYYK........',
    '........KKKKKKKKKKKKKK.........',
    '..........KDDDDDDDDK...........',
    '.........KDDdDDDDDDdK..........',
    '........KDDDDDDDDDDDdK.........',
    '.......KDDdDDDDDDDDDDdK........',
    '......KDDDDKKDDDKKDDDDdK.......',
    '.....KDDDDKPK.KPKDDDDDdK.......',
    '....KDDDDKPPK.KPPKDDDDDdK......',
    '...KDDDDKPPPKKKPPPKDDDDDdK.....',
    '...KPPPKPPPKDDDKPPPKPPPKdK.....',
    '...KPPPKPPKDDDDDKPPKPPPKPK.....',
    '...KPPPKKKDDDDDDDKKKPPPKdK.....',
    '....KKKK...........KKKKK.......',
  ];
  var reF1 = [
    '..........KKKKKKKKKK............',
    '.........KDDDdDDDDDDK...........',
    '........KDDDdDdDDDDDDK..........',
    '.......KDDdDDDDdDDDDDDK.........',
    '.....KKDDDDDDDDDDDDDDDDkK.......',
    '....KDDDDDdDDDDDDDdDDDDDDK......',
    '...KDDDDDDDDDDDDDDDDDDDDDDK.....',
    '..KDDDDDDDDDDDDDDDDDDDDDDDDK....',
    '..KDDDDDDDKCCccCCKDDDDDDDDDK...',
    '..KDDDDDDDKccCCccKDDDDDDDDDK...',
    '..KDDDDDDDKKKKKKKDDDDDDDDDdK...',
    '..KDDDDDDDDdDDdDDDDDDDDDDDDK...',
    '..KDDDDDDDDDDDDDDDDDDDDDDDdK...',
    '...KKDDDDDDDDDDDDDDDDDDDDkK....',
    '...KSKDDDDDDDDDDDDDDDDDdKSK....',
    '..KSSKKDDDDDDDDDDDDDDDKKSSdK...',
    '.KSSSKKDDDDDDDDDDDDDDKKSSSSKK..',
    'KSSSSSKKDDDDDDDDDDDDKKSSSSSSK..',
    'KSSSSSSKKDDDDDDDDDDKKSSSSSSSK..',
    'KSSSSSSSSKDDDDDDDDKSSSSSSSSSSK.',
    '.KGGggGGGGKDDDDDKGGGGgGGGGGK..',
    '..KGGGgGGGGKDDDKGGGGGGgGGGK...',
    '...KGGGGgGGGKDKGGGGGgGGGGK....',
    '....KGGGGGGGGKGGGGGGGGGGK.....',
    '.....KYGGGGGGGGGGGGGGGYK.......',
    '......KYYGGGGGGGGGGYYK.........',
    '.......KYYYYYYYYYYYYYYK........',
    '........KKKKKKKKKKKKKK.........',
    '..........KDDDDDDDDK...........',
    '.........KDDdDDDDDDdK..........',
    '........KDDDDDDDDDDDdK.........',
    '.......KDDdDDDDDDDDDDdK........',
    '......KDDDDKKDDDKKDDDDdK.......',
    '.....KDDDDKPKDDKPKDDDDDdK......',
    '....KDDDDKPPK..KPPKDDDDDdK.....',
    '...KDDDDKPPPKKKPPPKDDDDDdK.....',
    '...KPPPKPPPKDDDKPPPKPPPKdK.....',
    '...KPPPKPPKDDDDDKPPKPPPKPK.....',
    '...KPPPKKKDDDDDDDKKKPPPKdK.....',
    '....KKKK...........KKKKK.......',
  ];

  // ── ITEMS ─────────────────────────────────────────────────────────────────────

  // gemS 6x8
  var gsP = { K:K, C:'#44ccff', c:'#aaeeff', d:'#227799', W:'#ffffff' };
  var gsF0 = [
    '.KKKK.',
    'KCcCCK',
    'KCWcCK',
    'KCcCCK',
    'KCCcCK',
    'KCCCcK',
    '.KCcK.',
    '..KK..',
  ];
  var gsF1 = [
    '.KKKK.',
    'KCcWCK',
    'KWCcCK',
    'KCcCCK',
    'KcCCcK',
    'KCCCcK',
    '.KcCK.',
    '..KK..',
  ];

  // gemM 8x10
  var gmP = { K:K, G:'#33cc44', g:'#88ff99', d:'#116622', W:'#ffffff' };
  var gmF0 = [
    '..KKKK..',
    '.KGgGGK.',
    'KGGgGGGK',
    'KGGWGGgK',
    'KGgGGGGK',
    'KGGGgGGK',
    'KGGGGgGK',
    '.KGGgGK.',
    '.KGGGgK.',
    '..KKKK..',
  ];
  var gmF1 = [
    '..KKKK..',
    '.KGgWGK.',
    'KGGgGGGK',
    'KGWGGGgK',
    'KGgGGGGK',
    'KGGGgGGK',
    'KGGGGgGK',
    '.KGgGGK.',
    '.KGGGgK.',
    '..KKKK..',
  ];

  // gemL 10x12
  var glP = { K:K, R:'#ee4422', r:'#ff8866', O:'#ff6633', d:'#992211', W:'#ffffff' };
  var glF0 = [
    '...KKKK...',
    '..KRrRRK..',
    '.KRRrROOK.',
    'KRRROOOrRK',
    'KRRRWOOrRK',
    'KRROOOOrRK',
    'KROOOOOrRK',
    '.KRROrRRK.',
    '.KRROOrRK.',
    '..KRROrK..',
    '..KRRrRK..',
    '...KKKK...',
  ];
  var glF1 = [
    '...KKKK...',
    '..KRrWRK..',
    '.KRRrROOK.',
    'KRRROOOrRK',
    'KRWROOOrRK',
    'KRROOOOrRK',
    'KROOOOOrRK',
    '.KRROrRRK.',
    '.KRROOrRK.',
    '..KRROrK..',
    '..KRRrRK..',
    '...KKKK...',
  ];

  // chest 14x12
  var chP = { K:K, B:'#8b5a2b', b:'#a0703a', d:'#5a3515', Y:'#ffcc00', y:'#ffee88', G:'#888888', L:'#ffff44' };
  var chF0 = [
    '.KKKKKKKKKKKK.',
    'KBbBbBbBbBbBbK',
    'KBbBbBbBbBbBbK',
    'KBbBbBbBbBbBbK',
    'KGGGGGYGGGGGGK',
    'KGGGGGYGGGGGGK',
    'KKKKKKKKKKKKK.',
    'KdBbBbBbBbBdK.',
    'KdBBBBBBBBBdK.',
    'KdBbBbBbBbBdK.',
    'KdBBBBBBBBBdK.',
    'KKKKKKKKKKKK..',
  ];
  var chF1 = [
    '.KKKKKKKKKKKK.',
    'KBbBbBbBbBbBbK',
    'KBbLLLLLLLBbBK',
    'KBbLyLyLyLBbBK',
    'KGGGGGYGGGGGGK',
    'KGGGGGYGGGGGGK',
    'KKKKKKKKKKKKK.',
    'KdBbBbBbBbBdK.',
    'KdBBBBBBBBBdK.',
    'KdBbBbBbBbBdK.',
    'KdBBBBBBBBBdK.',
    'KKKKKKKKKKKK..',
  ];

  // heart 8x8
  var htP = { K:K, R:'#dd2244', r:'#ff5577', d:'#881122', W:'#ffffff' };
  var htF0 = [
    '.KKK.KKK',
    'KRrRKRrK',
    'KRRrRrRK',
    '.KRrrRrK',
    '..KRrRK.',
    '...KRK..',
    '....K...',
    '........',
  ];
  var htF1 = [
    '.KKK.KKK',
    'KrWRKrWK',
    'KRrWrRRK',
    '.KRrWrRK',
    '..KrRRK.',
    '...KrK..',
    '....K...',
    '........',
  ];

  // magnet 9x9
  var mgP = { K:K, R:'#cc2222', r:'#ee5544', S:'#cccccc', s:'#eeeeee', d:'#888888', W:'#ffffff' };
  var mgF0 = [
    '.KKKKKKK.',
    'KRrKKKSsK',
    'KRrK.KSsK',
    'KRrK.KSsK',
    '.KRrKSsK.',
    '..KRKSsK.',
    '..KRrSsK.',
    '..KRrSsK.',
    '...KKKK..',
  ];
  var mgF1 = [
    '.KKKKKKK.',
    'KRrKKKSsK',
    'KRrK.KSsK',
    'KRrK.KSsK',
    '.KRrKSsK.',
    '..KRKSsK.',
    '..KWrSeK.',
    '..KRrSsK.',
    '...KKKK..',
  ];

  // ── PROJECTILES ──────────────────────────────────────────────────────────────

  // bolt 8x4
  var boltP = { K:K, C:'#22ddff', c:'#aaffff', d:'#0099bb', W:'#ffffff' };
  var boltF0 = [
    '...KKK.K',
    '.KCcCCCK',
    '.KCWcCCK',
    '...KKK.K',
  ];
  var boltF1 = [
    '..KKK..K',
    '.KcCcCCK',
    '.KCcWCCK',
    '..KKK..K',
  ];

  // blade 10x10
  var bladeP = { K:K, S:'#aaaacc', s:'#ddddff', d:'#666688', Y:'#ffee44', W:'#ffffff' };
  var bladeF0 = [
    '.....KKKK.',
    '...KSsSsdK',
    '..KSSsSSdK',
    '.KSsWSSdK.',
    'KSSSSSdKK.',
    'KSSsSdK...',
    '.KSSdK....',
    '..KSdK....',
    '...KdK....',
    '....KK....',
  ];

  // axe 9x9
  var axeP = { K:K, S:'#999999', s:'#cccccc', d:'#555555', B:'#8b5a2b', b:'#c08040', Y:'#ffdd00' };
  var axeF0 = [
    '....KKKK.',
    '...KSsSdK',
    '..KsSsSdK',
    '.KSSsSSdK',
    'KSSsSSSdK',
    '.KSSBBdK.',
    '..KBBbK..',
    '..KBBbK..',
    '...KBK...',
  ];

  // wisp 8x8
  var wispP = { K:K, T:'#22bbaa', t:'#55ddcc', c:'#aaffee', d:'#116655', W:'#ffffff' };
  var wispF0 = [
    '..KKKK..',
    '.KTtTtK.',
    'KTtcTtTK',
    'KTcWcTtK',
    'KTtcTtTK',
    '.KTtTTK.',
    '..KTtK..',
    '...KK...',
  ];
  var wispF1 = [
    '..KKKK..',
    '.KtTtTK.',
    'KTtTcTTK',
    'KtcTWcTK',
    'KTTtcTTK',
    '.KTTtTK.',
    '..KtTK..',
    '...KK...',
  ];

  // ball 6x6
  var ballP = { K:K, P:'#8833cc', p:'#bb66ff', L:'#ddaaff', d:'#441188', W:'#ffffff' };
  var ballF0 = [
    '.KKKK.',
    'KPpPLK',
    'KPWpPK',
    'KPpPPK',
    'KdPPPK',
    '.KKKK.',
  ];
  var ballF1 = [
    '.KKKK.',
    'KpPLpK',
    'KPpWpK',
    'KpPPpK',
    'KdPpPK',
    '.KKKK.',
  ];

  // scythe 10x10
  var scP = { K:K, S:'#aaaacc', s:'#ddddff', d:'#555577', Y:'#ffee44', B:'#8b5a2b' };
  var scF0 = [
    '....KKKK..',
    '...KsSsSK.',
    '..KSSsSSK.',
    '.KSsSWSSdK',
    'KSSSSSSdK.',
    'KSSSSSdK..',
    '.KSSBdK...',
    '..KBBdK...',
    '...KBK....',
    '....KK....',
  ];
  var scF1 = [
    'KK........',
    '.KYK......',
    '..KsSK....',
    '..KSSsK...',
    '.KSsSSdK..',
    'KSSSSdK...',
    'KSSSdK....',
    '.KSBdK....',
    '..KBK.....',
    '...KK.....',
  ];

  // ── ICONS  12x12  1 frame each ────────────────────────────────────────────────
  var iP = {
    K: K,
    C: '#22ddff', c: '#aaffff',   // cyan
    G: '#33cc44', g: '#88ff99',   // green
    R: '#ee4422', r: '#ff8866',   // red
    Y: '#ffcc00', y: '#ffee88',   // yellow
    P: '#9933cc', p: '#cc77ff',   // purple
    B: '#2244bb', b: '#6699ff',   // blue
    S: '#cccccc', s: '#eeeeee',   // silver
    O: '#ff8800', o: '#ffaa44',   // orange
    W: '#ffffff',
    T: '#22bbaa', t: '#55ddcc',   // teal
    M: '#888888', m: '#aaaaaa',   // grey
    L: '#aaff44', l: '#ccff99',   // lime
    D: '#885533', d: '#aa7744',   // brown
    H: '#dd1133', h: '#ff5577',   // heart red
    E: '#ff2244',
  };

  // bolt icon – cyan lightning bolt
  var ioBolt = [
    '....KKKK....',
    '...KCcCCK...',
    '..KCcCCcCK..',
    '.KCcCCcCCCK.',
    'KCCcCCcCCCCK',
    'KCCKKKKcCCCK',
    'KKCcCCcKKKKK',
    '.KCcCCcCK...',
    '..KCcCCCK...',
    '...KCcCK....',
    '....KCcK....',
    '.....KKK....',
  ];

  // blade icon – orbiting crescent blades
  var ioBlade = [
    '..KK....KK..',
    '.KSSk..KSSK.',
    '.KSSsKKsSSK.',
    '..KsSSSSsK..',
    'KKSSssssSKKK',
    'KSsssWWsssSK',
    'KSsssWWsssSK',
    'KKSSssssSKKK',
    '..KsSSSSsK..',
    '.KSSsKKsSSK.',
    '.KSSk..KSSK.',
    '..KK....KK..',
  ];

  // thunder icon – fat lightning bolt
  var ioThunder = [
    '....KKKKKK..',
    '...KYyYyYYK.',
    '..KYyYyYYYK.',
    '.KYyYYYYYYK.',
    'KYYYYYKKKkK.',
    'KYYYKKKyYYYK',
    '.KKKyYYYyYYK',
    '...KYyYYYYYK',
    '...KYyYYYYK.',
    '....KYyYYK..',
    '.....KYyK...',
    '......KKK...',
  ];

  // aura icon – holy ring
  var ioAura = [
    '...KKKKKK...',
    '..KyYYYYYK..',
    '.KyYKKKKYYK.',
    'KyYKKKKKKYyK',
    'KYYKKWKKKYyK',
    'KYyKKWKKKYYK',
    'KYYKKKKKKYyK',
    'KyYKKKKKKYYK',
    '.KYYKKKKYYK.',
    '..KYYYYYYyK.',
    '...KKKKKK...',
    '............',
  ];

  // axe icon – throwing axe
  var ioAxe = [
    '.....KKKK...',
    '....KSSsSK..',
    '...KSsSSSK..',
    '..KSSsSSSSK.',
    '.KSsSSSSSSK.',
    'KSSSSSSSSdK.',
    'KSSSSSSdK...',
    '.KSSBBdK....',
    '..KBBbK.....',
    '..KBBbK.....',
    '...KBbK.....',
    '....KKK.....',
  ];

  // wisp icon – spirit flame
  var ioWisp = [
    '....KKKK....',
    '...KTtTtK...',
    '..KTtcTtTK..',
    '.KTtcWcTtTK.',
    'KTtTcTtcTtTK',
    'KTtcTtTcTtTK',
    'KTtTtcTtTtTK',
    '.KTtcTtcTtK.',
    '..KTtTtTtK..',
    '...KTtTtK...',
    '....KTtK....',
    '.....KKK....',
  ];

  // boots icon – speed boots
  var ioBoots = [
    '............',
    '...KKKKK....',
    '..KDdDdDK...',
    '.KDdKKKdDK..',
    '.KDdK.KdDK..',
    '.KDdDdDdDK..',
    '.KKKKKKKKK..',
    '.KDdDdDdDK..',
    '.KDdDdDdDK..',
    '.KDKKKKKdK..',
    '.KdddddddK..',
    '..KKKKKKK...',
  ];

  // power icon – upward sword
  var ioPower = [
    '.....KK.....',
    '....KSSk....',
    '...KSsSK....',
    '..KSsSSSK...',
    '.KSsSSSSsK..',
    'KSSsSSSSssK.',
    '.KSSSSSSSsK.',
    '..KSSSSSSsK.',
    '...KSSSSsK..',
    '....KSSSsK..',
    '.....KSSKyK.',
    '......KKKK..',
  ];

  // heart icon
  var ioHeart = [
    '............',
    '.KKK..KKK...',
    'KHhHKKHhHK..',
    'KHhHhHhHHK..',
    '.KHhhHhHhK..',
    '..KHhHhHK...',
    '...KHhHK....',
    '....KHK.....',
    '.....K......',
    '............',
    '............',
    '............',
  ];

  // magnet icon
  var ioMagnet = [
    '............',
    '..KKKKKKK...',
    '.KRrKKKSsK..',
    '.KRrK.KSsK..',
    '.KRrK.KSsK..',
    '..KRrKSsK...',
    '...KRKSsK...',
    '...KRrSsK...',
    '...KRrSsK...',
    '....KKKK....',
    '............',
    '............',
  ];

  // tome icon – spell book
  var ioTome = [
    '..KKKKKKKK..',
    '.KDdDdDdDdK.',
    '.KdDdDdDdDK.',
    '.KDdDdDdDdK.',
    '.KdKKKKKKdK.',
    '.KDKCcCCKdK.',
    '.KdKCCcCKDK.',
    '.KDKcCCcKdK.',
    '.KdKKKKKKDK.',
    '.KDdDdDdDdK.',
    '.KdDdDdDdDK.',
    '..KKKKKKKK..',
  ];

  // lens icon – lucky clover (crit)
  var ioLens = [
    '...KKKKKK...',
    '..KLlLlLlK..',
    '.KLlKKKKlLK.',
    'KLlKKKKKKlLK',
    'KLlKKKKKKlLK',
    'KLlKKWKKKlLK',
    'KLlKKWKKKlLK',
    'KLlKKKKKKlLK',
    'KLlKKKKKKlLK',
    '.KLlKKKKlLK.',
    '..KLlLlLlK..',
    '...KKKKKK...',
  ];

  // ── Assemble SPRITES ──────────────────────────────────────────────────────────
  function spr(frames, w, h) { return { frames: frames, w: w, h: h }; }

  var SPRITES = {
    player: spr(playerFrames, 16, 16),
    enemies: {
      zombie:   spr([px(zP,  zF0),   px(zP,  zF1)],   14, 16),
      bat:      spr([px(batP,batF0), px(batP,batF1)],  12, 10),
      skeleton: spr([px(skP, skF0),  px(skP, skF1)],   14, 16),
      ghost:    spr([px(ghP, ghF0),  px(ghP, ghF1)],   14, 14),
      brute:    spr([px(brP, brF0),  px(brP, brF1)],   20, 20),
      imp:      spr([px(impP,impF0), px(impP,impF1)],  12, 12),
    },
    bosses: {
      king:   spr([px(kgP, kgF0),  px(kgP, kgF1)],  32, 36),
      wyrm:   spr([px(wyP, wyF0),  px(wyP, wyF1)],   48, 28),
      reaper: spr([px(reP, reF0),  px(reP, reF1)],   32, 40),
    },
    items: {
      gemS:   spr([px(gsP, gsF0),  px(gsP, gsF1)],   6,  8),
      gemM:   spr([px(gmP, gmF0),  px(gmP, gmF1)],   8, 10),
      gemL:   spr([px(glP, glF0),  px(glP, glF1)],  10, 12),
      chest:  spr([px(chP, chF0),  px(chP, chF1)],  14, 12),
      heart:  spr([px(htP, htF0),  px(htP, htF1)],   8,  8),
      magnet: spr([px(mgP, mgF0),  px(mgP, mgF1)],   9,  9),
    },
    proj: {
      bolt:   spr([px(boltP, boltF0),  px(boltP, boltF1)],   8,  4),
      blade:  spr([px(bladeP, bladeF0)],                     10, 10),
      axe:    spr([px(axeP,   axeF0)],                        9,  9),
      wisp:   spr([px(wispP,  wispF0),  px(wispP, wispF1)],   8,  8),
      ball:   spr([px(ballP,  ballF0),  px(ballP, ballF1)],   6,  6),
      scythe: spr([px(scP,    scF0),    px(scP,   scF1)],    10, 10),
    },
    icons: {
      bolt:    spr([px(iP, ioBolt)],    12, 12),
      blade:   spr([px(iP, ioBlade)],   12, 12),
      thunder: spr([px(iP, ioThunder)], 12, 12),
      aura:    spr([px(iP, ioAura)],    12, 12),
      axe:     spr([px(iP, ioAxe)],     12, 12),
      wisp:    spr([px(iP, ioWisp)],    12, 12),
      boots:   spr([px(iP, ioBoots)],   12, 12),
      power:   spr([px(iP, ioPower)],   12, 12),
      heart:   spr([px(iP, ioHeart)],   12, 12),
      magnet:  spr([px(iP, ioMagnet)],  12, 12),
      tome:    spr([px(iP, ioTome)],    12, 12),
      lens:    spr([px(iP, ioLens)],    12, 12),
    },
  };

  // ── Validation pass ───────────────────────────────────────────────────────────
  var required = [
    'player',
    'enemies.zombie','enemies.bat','enemies.skeleton','enemies.ghost',
    'enemies.brute','enemies.imp',
    'bosses.king','bosses.wyrm','bosses.reaper',
    'items.gemS','items.gemM','items.gemL','items.chest','items.heart','items.magnet',
    'proj.bolt','proj.blade','proj.axe','proj.wisp','proj.ball','proj.scythe',
    'icons.bolt','icons.blade','icons.thunder','icons.aura','icons.axe','icons.wisp',
    'icons.boots','icons.power','icons.heart','icons.magnet','icons.tome','icons.lens',
  ];
  required.forEach(function (path) {
    var parts = path.split('.');
    var obj = SPRITES;
    for (var i = 0; i < parts.length; i++) { obj = obj && obj[parts[i]]; }
    if (!obj || !obj.frames || obj.frames.length === 0) {
      console.error('[SPRITES] missing: ' + path);
    }
  });

  return SPRITES;
}());
