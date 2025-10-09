import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const webhookData = JSON.parse(body);
    const events = webhookData.events;

    for (const event of events) {
      if (
        event.type === "postback" &&
        event.postback.data === "action=open_form"
      ) {
        const userId = event.source.userId;

        const existingRegistration = await prisma.lineRegistration.findFirst({
          where: { lineUserId: userId },
        });

        const channelAccessToken = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.10.200:3000";

        if (existingRegistration) {
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
                  type: "text",
                  text: "既に登録済みです。ありがとうございます！",
                },
              ],
            }),
          });
        } else {
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
