import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const channelAccessToken = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      return NextResponse.json(
        { error: "LINE Bot Channel Access Token not configured" },
        { status: 500 }
      );
    }

    // LINE Bot APIでユーザープロフィールを取得
    const response = await fetch(
      `https://api.line.me/v2/bot/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to get user profile:", await response.text());
      return NextResponse.json(
        { error: "Failed to get user profile" },
        { status: response.status }
      );
    }

    const profile = await response.json();

    return NextResponse.json({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
