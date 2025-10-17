import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/database";
import { LineRegistration } from "@/entities/lineRegistration.entity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const webhookData = JSON.parse(body);
    const events = webhookData.events;

    // データベース接続を初期化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const registrationRepository =
      AppDataSource.getRepository(LineRegistration);

    for (const event of events) {
      if (
        event.type === "postback" &&
        event.postback.data === "action=open_form"
      ) {
        const userId = event.source.userId;

        // 登録済みかチェック
        const existingRegistration = await registrationRepository.findOne({
          where: { lineUserId: userId },
        });

        const channelAccessToken = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://yahaira-semirationalized-andra.ngrok-free.dev";

        if (existingRegistration) {
          // 登録済みの場合、フォームへのリンクを送信（上書き可能）
          const formUrl = `${baseUrl}?lineUserId=${userId}`;
          await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
              to: userId,
              messages: [
                {
                  type: "template",
                  altText: "登録情報の更新",
                  template: {
                    type: "buttons",
                    text: `${
                      existingRegistration.nameKanji
                    } 様\n\n既に登録済みです。\n登録日: ${new Date(
                      existingRegistration.createdAt
                    ).toLocaleDateString(
                      "ja-JP"
                    )}\n\n登録情報を更新することができます。`,
                    actions: [
                      {
                        type: "uri",
                        label: "登録情報を更新",
                        uri: formUrl,
                      },
                    ],
                  },
                },
              ],
            }),
          });
        } else {
          // 未登録の場合、フォームへのリンクを送信
          const formUrl = `${baseUrl}?lineUserId=${userId}`;
          await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
              to: userId,
              messages: [
                {
                  type: "template",
                  altText: "登録フォームを開く",
                  template: {
                    type: "buttons",
                    text: "登録フォームを開きます。",
                    actions: [
                      {
                        type: "uri",
                        label: "登録フォームを開く",
                        uri: formUrl,
                      },
                    ],
                  },
                },
              ],
            }),
          });
        }
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
