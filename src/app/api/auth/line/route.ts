import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // LINE Access Tokenを取得
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/line`,
        client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
        client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL("/?error=token_failed", request.url)
      );
    }

    // LINEユーザー情報を取得
    const profileResponse = await fetch("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    // URLパラメータとしてLINEユーザー情報を渡してリダイレクト
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("lineLogin", "success");
    redirectUrl.searchParams.set("lineUserId", profile.userId);
    redirectUrl.searchParams.set("lineDisplayName", profile.displayName);
    if (profile.pictureUrl) {
      redirectUrl.searchParams.set("linePictureUrl", profile.pictureUrl);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("LINE Login error:", error);
    return NextResponse.redirect(new URL("/?error=login_failed", request.url));
  }
}
