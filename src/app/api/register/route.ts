import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const {
      nameKanji,
      nameKatakana,
      phoneNumber,
      companyName,
      email,
      birthDate,
      lineUserId,
      lineDisplayName,
      linePictureUrl,
    } = body;

    if (
      !nameKanji ||
      !nameKatakana ||
      !phoneNumber ||
      !companyName ||
      !email ||
      !birthDate
    ) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    // データベースに保存
    const registration = await prisma.lineRegistration.create({
      data: {
        nameKanji,
        nameKatakana,
        phoneNumber,
        companyName,
        email,
        birthDate: new Date(birthDate),
        lineUserId: lineUserId || null,
        lineDisplayName: lineDisplayName || null,
        linePictureUrl: linePictureUrl || null,
      },
    });

    console.log("新規登録完了:", registration);

    return NextResponse.json(
      { message: "登録が完了しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
