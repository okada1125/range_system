import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/database";
import { LineRegistration } from "@/entities/lineRegistration.entity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId } = body;

    if (!lineUserId) {
      return NextResponse.json(
        { error: "LINE User IDが必要です" },
        { status: 400 }
      );
    }

    // データベース接続を初期化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const registrationRepository =
      AppDataSource.getRepository(LineRegistration);

    // データベースで既存の登録を確認
    const existingRegistration = await registrationRepository.findOne({
      where: { lineUserId },
    });

    if (existingRegistration) {
      return NextResponse.json({
        registered: true,
        registration: {
          nameKanji: existingRegistration.nameKanji,
          email: existingRegistration.email,
          createdAt: existingRegistration.createdAt,
        },
      });
    }

    return NextResponse.json({ registered: false });
  } catch (error) {
    console.error("Registration check error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
