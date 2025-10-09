# LINE Official Account Registration Form

LINE公式アカウントのリッチメニューから開く登録フォームです。

## 機能

- LINEリッチメニューからの自動LINE ID取得
- ユーザー登録フォーム
- 管理者画面での登録データ確認・CSV出力
- LINE Bot APIとの連携

## 技術スタック

- Next.js 15
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- React Hook Form + Zod

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
```bash
cp .env.example .env.local
```

3. データベースのセットアップ
```bash
npx prisma db push
npx prisma generate
```

4. 開発サーバーの起動
```bash
npm run dev
```

## 環境変数

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/line_official_register?schema=public"
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID="your_line_login_channel_id"
LINE_LOGIN_CHANNEL_SECRET="your_line_login_channel_secret"
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
LINE_BOT_CHANNEL_ACCESS_TOKEN="your_bot_channel_access_token"
LINE_BOT_CHANNEL_SECRET="your_bot_channel_secret"
```

## デプロイ

Vercelでのデプロイに対応しています。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/line-official-register)