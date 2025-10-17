import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    // データベース接続を初期化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // テーブルを同期（synchronize: true で自動テーブル作成）
    await AppDataSource.synchronize();

    console.log("データベース初期化完了");

    return NextResponse.json(
      { message: "データベース初期化が完了しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { error: "データベース初期化に失敗しました" },
      { status: 500 }
    );
  }
}
