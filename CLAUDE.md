# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## モデル運用
トークン削減のため実装やテストなどのタスクの複雑さを評価し、サブエージョントのopusやsonnetの使用を検討する。(fable 5は出力トークンがコスト高い)

## プロジェクト概要

「PIXEL SURVIVORS」— Vampire Survivors ライクのブラウザゲーム。純粋な HTML / CSS / JavaScript 製で、ビルドシステム・パッケージ依存・フレームワーク・テストは一切なし。コメント・UI テキストは日本語。元の要件は `要件.txt` を参照。

## コマンド

- **実行**: `index.html` をブラウザで開くだけ。音楽(mp3)の読み込みのため静的サーバー経由が確実: `npx serve` や `python -m http.server` など。
- **items.csv の再生成**: `node scripts/export-items.js` — `js/data.js` のバランス値からアイテム一覧 CSV を生成する。**`items.csv` は生成物なので手で編集しない**。`data.js` を変更したら必ず再実行する。
- ビルド・lint・テストのコマンドは存在しない。

## アーキテクチャ

全 JS は classic script(モジュールなし)で、グローバル変数経由で連携する。`index.html` の読み込み順が依存関係そのもの:

```
sprites.js → sprites-extra.js → audio.js → data.js → game.js
```

- **`js/sprites.js`** — `window.SPRITES` を定義。ドット絵は画像ファイルではなく、`px(palette, rows)` ヘルパーで ASCII アート文字列 + パレットから canvas を手続き生成する。
- **`js/sprites-extra.js`** — 追加コンテンツ(fire/blizzard 武器、area/regen パッシブ、アーティファクト宝珠)のスプライトを `SPRITES` に追記。sprites.js の後に読み込む必要がある。
- **`js/audio.js`** — `window.AudioMan` を定義。BGM は `music/` の mp3 を HTMLAudio で再生(クロスフェード付き)。効果音は音声ファイルなしで WebAudio シンセ生成。ボス曲のキー(boss1 等)は data.js のボス定義の `music` フィールドと対応。
- **`js/data.js`** — グローバル `DATA`。敵・ボス・出現スケジュール・武器(各 Lv1〜5)・パッシブ・アーティファクト・ステージ配色など、ゲームバランスの全定義。バランス調整はここで行う。
- **`js/game.js`** — モノリシックなメインエンジン(約 1800 行)。`// ====` 区切りのセクションコメントで構成されている: ブートストラップ / 状態 / 入力 / 演出ヘルパー / 空間グリッド / プレイヤー / 武器 / 敵・ボス / アーティファクト / ジェム・ドロップ / スポナー / レベルアップ UI / HUD / 描画 / メインループ。

### 押さえておくべき設計事項

- **ゲーム状態機械**: `state` グローバル変数(`title | play | levelup | pause | over | victory`)。画面遷移は game.js の「画面遷移」セクションの関数群で行う。
- **座標スケール**: `SCALE = 3`(アート px → ワールド px)。data.js の通常敵の `r` はアート単位 px でゲーム側が ×SCALE する。ボスの `r` はワールド px 直値。描画は canvas 2D + `imageSmoothingEnabled = false`。
- **スプライト欠損のフォールバック**: `spr()` は SPRITES に該当パスがないとマゼンタ矩形を返す。画面にマゼンタの四角が出たらスプライト名の不一致を疑う。
- **整合性の制約**: `scripts/export-items.js` 内のパッシブ効果計算式(`passiveFx`)は game.js の `recalc()` の実装と一致させること。ドロップアイテムの数値も game.js の実装値を手書きで写している。game.js 側を変更したら export-items.js も追従させる。
- 衝突判定は空間グリッド(`buildGrid` / `forEachInRadius`)経由。敵が多数出るため、全敵走査を追加するときはこのグリッドを使う。
