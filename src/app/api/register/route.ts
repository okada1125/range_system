import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/database";
import { LineRegistration } from "@/entities/lineRegistration.entity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nameKanji,
      nameKatakana,
      phoneNumber,
      companyName,
      email,
      birthDate,
      lineUserId,
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

    // データベース接続を初期化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const registrationRepository =
      AppDataSource.getRepository(LineRegistration);

    // 同じLINE IDが既に存在するかチェック
    let existingRegistration = null;
    if (lineUserId) {
      existingRegistration = await registrationRepository.findOne({
        where: { lineUserId: lineUserId },
      });
    }

    let savedRegistration;
    let isUpdate = false;

    if (existingRegistration) {
      // 既存の登録を更新
      existingRegistration.nameKanji = nameKanji;
      existingRegistration.nameKatakana = nameKatakana;
      existingRegistration.phoneNumber = phoneNumber;
      existingRegistration.companyName = companyName;
      existingRegistration.email = email;
      existingRegistration.birthDate = new Date(birthDate);
      // lineUserIdは既に設定されているので更新不要

      savedRegistration = await registrationRepository.save(
        existingRegistration
      );
      isUpdate = true;
      console.log("登録情報を更新しました:", savedRegistration);
    } else {
      // 新規登録
      const registration = new LineRegistration();
      registration.nameKanji = nameKanji;
      registration.nameKatakana = nameKatakana;
      registration.phoneNumber = phoneNumber;
      registration.companyName = companyName;
      registration.email = email;
      registration.birthDate = new Date(birthDate);
      registration.lineUserId = lineUserId;

      savedRegistration = await registrationRepository.save(registration);
      console.log("新規登録完了:", savedRegistration);
    }

    return NextResponse.json(
      {
        message: isUpdate ? "登録情報を更新しました" : "登録が完了しました",
        id: savedRegistration.id,
        isUpdate: isUpdate,
      },
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
