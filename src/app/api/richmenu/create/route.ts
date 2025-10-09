import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const channelAccessToken = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      return NextResponse.json(
        { error: "LINE Bot Channel Access Token not configured" },
        { status: 500 }
      );
    }

    // リッチメニューの定義
    const richMenu = {
      size: {
        width: 2500,
        height: 1686,
      },
      selected: false,
      name: "LINE公式登録メニュー",
      chatBarText: "登録フォーム",
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 2500,
            height: 1686,
          },
          action: {
            type: "postback",
            data: "action=open_form",
            displayText: "登録フォームを開く",
          },
        },
      ],
    };

    // LINE Messaging API でリッチメニューを作成
    const response = await fetch("https://api.line.me/v2/bot/richmenu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify(richMenu),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Rich menu creation failed:", errorText);
      return NextResponse.json(
        { error: "Failed to create rich menu", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      message: "Rich menu created successfully",
      richMenuId: result.richMenuId,
    });
  } catch (error) {
    console.error("Rich menu creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
