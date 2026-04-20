# Closet Weather (クローゼット天気コーデ)

毎日の服装に迷いたくない人のための、天気連動・手持ち服コーデ提案PWAです。
自分の持っている服を登録しておくだけで、今日の気温・降水・風などに合わせて
「今日はこれを着ればOK」という提案を返します。

## 特長

- 🌤 **天気連動**: Open-Meteo API を利用。GPS or 地名検索で地域設定。
- 👕 **手持ちの服ベース**: IndexedDB（Dexie）に服を保存し、ローカル完結。
- 🧠 **ルールベース提案**: 気温帯 × 寒がり設定 × 雨/風/通勤属性で補正。
- 🔄 **3案を同時提示**: 「きょうのおすすめ / 少し暖かめ / 少し軽め」。
- 🆕 **未登録でも使える**: 登録が少ないときは一般的な参考コーデをフォールバック表示。
- 🗓 **着用履歴**: ワンタップで記録。よく着る服が見える／着すぎを避けるロジックに反映。
- 📱 **PWA**: manifest / service worker 対応。iPhone / Android どちらでもホーム画面追加可。
- 🌓 **ダーク対応**: OSのカラースキームに追従。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:5173` を開いてください。

初回起動時はセットアップ画面に遷移します。
- 表示名・寒がり度・スタイル・通勤などを選択
- 地域は GPS か都市名検索から選択
- 「サンプル服を少し入れておく」にチェックを入れると白Tシャツ等が自動投入されます

## ビルド

```bash
npm run build
npm run preview
```

`npm run preview` が起動したら実ブラウザ（モバイル実機がおすすめ）で開いて、
Service Worker が登録されることを確認してください。
Chrome DevTools の Application → Manifest / Service Workers タブで PWA 状態を確認できます。

## PWA として確認

1. `npm run build && npm run preview`
2. ブラウザで開いて Lighthouse → Progressive Web App を実行
3. iOS Safari からは「ホーム画面に追加」、Android Chrome からはインストールバナーから追加
4. 機内モードで再読み込みし、オフラインでも既存データが閲覧できることを確認

## データ保存

すべてローカルに保存されます（端末内の IndexedDB）。
- 服アイテム: `items` テーブル（画像は Blob でそのまま保存）
- ユーザープロファイル: `profile` テーブル
- 着用履歴: `wearLogs` テーブル
- 設定: `settings` テーブル
- 天気キャッシュ: `weatherCache` テーブル

設定画面から JSON でエクスポート・インポートが可能です（画像 Blob はエクスポート対象外）。

## 天気APIの差し替え方法

`src/services/weather/types.ts` に `WeatherService` インターフェースを定義しています。
標準実装は `src/services/weather/openMeteo.ts` にあります。

別のAPI（OpenWeather, WeatherAPI, 自社のプロキシ等）を使う場合は、

1. `WeatherService` を実装したクラスを新規作成
2. `src/hooks/useWeather.ts` の `weatherService` を差し替え

インターフェース:

```ts
export interface WeatherService {
  getByCoordinates(latitude: number, longitude: number, locationName?: string): Promise<WeatherSnapshot>;
  searchLocation(query: string): Promise<GeocodingResult[]>;
}
```

## 提案ロジック

`src/engine/` に分離しています。

- `weatherProfile.ts` — 生の天気データとユーザー属性から「効いている体感気温」等を作る
- `layers.ts` — 気温帯ごとに必要な服装レベル（厚み/アウター要否/雨対応）を決める
- `scoring.ts` — 手持ちアイテムを各スロット（tops/bottoms/outer/shoes）でスコアリング
- `fallback.ts` — 手持ちが少ないときの参考コーデ生成
- `engine.ts` — 3案（today / warmer / lighter）＋ fallback を束ねるエントリポイント
- `explain.ts` — 「この提案の根拠」のテキスト生成

すべてピュアなロジックなので、UIから独立してテスト可能です。
`npm run test` で Vitest が走ります。

## テスト

```bash
npm run test
```

`src/engine/engine.test.ts` に、気温帯／雨／お気に入り優先／寒がり補正のケースを含めています。

## 主なファイル構成

```
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── favicon.svg
│   └── icons/icon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── BottomNav.tsx
    │   ├── ColorPicker.tsx
    │   ├── ItemCard.tsx
    │   ├── SuggestionCard.tsx
    │   └── WeatherCard.tsx
    ├── data/
    │   └── seed.ts
    ├── db/
    │   └── db.ts
    ├── engine/
    │   ├── engine.ts
    │   ├── engine.test.ts
    │   ├── explain.ts
    │   ├── fallback.ts
    │   ├── layers.ts
    │   ├── scoring.ts
    │   └── weatherProfile.ts
    ├── hooks/
    │   ├── useSuggestions.ts
    │   └── useWeather.ts
    ├── screens/
    │   ├── ClosetScreen.tsx
    │   ├── HistoryScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── ItemAddScreen.tsx
    │   ├── ItemEditScreen.tsx
    │   ├── ItemForm.tsx
    │   ├── SettingsScreen.tsx
    │   ├── SetupScreen.tsx
    │   ├── SuggestionDetailScreen.tsx
    │   └── WardrobeSummaryScreen.tsx
    ├── services/
    │   └── weather/
    │       ├── openMeteo.ts
    │       └── types.ts
    ├── store/
    │   └── appStore.ts
    ├── styles/
    │   └── global.css
    ├── types/
    │   └── index.ts
    └── utils/
        ├── defaults.ts
        ├── format.ts
        └── image.ts
```

## 今後の拡張ポイント

- [ ] 写真からのカテゴリ / 色の自動タグ補助（ブラウザ内 ML）
- [ ] 背景除去（remove.bg 的な処理をローカル実行）
- [ ] 色合わせの提案強化（トップス/ボトムスのカラーコンビ検査）
- [ ] 週間コーデ（1週間分を一気に決める）
- [ ] 明日の服装予告通知（Web Push）
- [ ] カレンダー連動（予定のフォーマル度を取り込む）
- [ ] クラウド同期（Firebase / Supabase 等）
- [ ] 多言語化（`src/utils/format.ts` と `types` のラベルを i18n キーに移す）

## ライセンス

MIT（社内ユースを想定した MVP。必要に応じて変更してください）
