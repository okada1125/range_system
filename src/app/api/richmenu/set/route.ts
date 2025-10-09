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

    const { richMenuId } = await request.json();

    if (!richMenuId) {
      return NextResponse.json(
        { error: "Rich menu ID is required" },
        { status: 400 }
      );
    }

    // リッチメニューをデフォルトに設定
    const response = await fetch(
      `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Rich menu setting failed:", errorText);
      return NextResponse.json(
        { error: "Failed to set rich menu", details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Rich menu set successfully",
    });
  } catch (error) {
    console.error("Rich menu setting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
