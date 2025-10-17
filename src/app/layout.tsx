import { initializeDatabase } from "@/lib/database";

// データベースを初期化
initializeDatabase().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          charSet="utf-8"
          async
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
