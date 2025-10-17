"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";

// バリデーションスキーマ
const registerSchema = z.object({
  nameKanji: z.string().min(1, "お名前（漢字）を入力してください"),
  nameKatakana: z
    .string()
    .min(1, "オナマエ（カタカナ）を入力してください")
    .regex(/^[ァ-ヶー\s]+$/, "カタカナで入力してください"),
  phoneNumber: z
    .string()
    .min(1, "電話番号を入力してください")
    .regex(/^[0-9-+()]+$/, "正しい電話番号を入力してください"),
  companyName: z.string().min(1, "会社名・屋号を入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),
  birthDate: z.string().min(1, "生年月日を選択してください"),
  lineUserId: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState<{
    nameKanji: string;
    email: string;
    createdAt: Date;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // LIFF初期化とLINEユーザーID取得
  useEffect(() => {
    const initializeLiff = async () => {
      if (typeof window !== "undefined" && window.liff) {
        try {
          await window.liff.init({ liffId: "2008256152-pOz4Rxrz" });
          console.log("LIFF初期化成功");
          if (window.liff.isLoggedIn()) {
            const profile = await window.liff.getProfile();
            console.log("LINE プロフィール取得:", profile);
            setLineUserId(profile.userId);
            // 登録済みかチェック
            checkRegistration(profile.userId);
          } else {
            console.log("LIFFにログインしていません");
          }
        } catch (error) {
          console.error("LIFF初期化エラー:", error);
          // LIFF初期化に失敗した場合は、ブラウザ環境として扱う
        }
      }
    };

    // LIFFスクリプトが読み込まれるまで待つ
    if (typeof window !== "undefined" && !window.liff) {
      const script = document.createElement("script");
      script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
      script.onload = initializeLiff;
      script.onerror = () => {
        console.log(
          "LIFF SDKの読み込みに失敗しました。ブラウザ環境として動作します。"
        );
      };
      document.head.appendChild(script);
    } else {
      initializeLiff();
    }
  }, []);

  // URLパラメータからLINE User IDを取得
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lineUserIdParam = urlParams.get("lineUserId");
    console.log("URLパラメータから取得したLINE User ID:", lineUserIdParam);

    if (lineUserIdParam) {
      setLineUserId(lineUserIdParam);
      // 登録済みかチェック
      checkRegistration(lineUserIdParam);
    }
  }, []);

  // 登録済みチェック関数
  const checkRegistration = async (userId: string) => {
    try {
      const response = await fetch("/api/check-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineUserId: userId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.registered) {
          setIsAlreadyRegistered(true);
          setRegistrationInfo(result.registration);
        }
      }
    } catch (error) {
      console.error("Registration check error:", error);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    try {
      const formData = {
        ...data,
        lineUserId: lineUserId || undefined,
      };

      console.log("送信データ:", formData); // デバッグ用ログ

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("登録成功:", result);
        setIsSuccess(true);
        reset();
      } else {
        const error = await response.json();
        alert(`登録に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("登録に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // LIFF環境かどうかを判定する関数
  const isLiffEnvironment = () => {
    return (
      typeof window !== "undefined" &&
      window.liff &&
      window.liff.isInClient &&
      window.liff.isInClient()
    );
  };

  const handleCloseWindow = () => {
    // LIFF環境ではLINEアプリに戻る
    try {
      window.liff.closeWindow();
    } catch (error) {
      console.error("LIFF closeWindow error:", error);
      // LIFFでエラーが発生した場合はリダイレクト
      window.location.href = "/";
    }
  };

  // 登録済みの場合
  if (isAlreadyRegistered && registrationInfo) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
        }}
      >
        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "2px solid #fbbf24",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#92400e",
              marginBottom: "12px",
            }}
          >
            既に登録済みです
          </h2>
          <p style={{ color: "#78350f", marginBottom: "8px" }}>
            {registrationInfo.nameKanji} 様
          </p>
          <p style={{ color: "#78350f", fontSize: "14px" }}>
            登録日:{" "}
            {new Date(registrationInfo.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
        {isLiffEnvironment() && (
          <button
            onClick={handleCloseWindow}
            style={{
              backgroundColor: "#00b900",
              color: "white",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            閉じる
          </button>
        )}
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
        }}
      >
        <CheckCircle
          style={{
            width: "64px",
            height: "64px",
            color: "#10b981",
            margin: "0 auto 16px",
          }}
        />
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          登録完了！
        </h2>
        <p
          style={{
            color: "#6b7280",
            marginBottom: isLiffEnvironment() ? "24px" : "0",
          }}
        >
          ご登録いただき、ありがとうございました。
        </p>
        {isLiffEnvironment() && (
          <button
            onClick={handleCloseWindow}
            style={{
              backgroundColor: "#00b900",
              color: "white",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            閉じる
          </button>
        )}
      </div>
    );
  }

  const fieldStyle = {
    marginBottom: "16px",
  };

  const labelStyle = {
    fontWeight: "500",
    fontSize: "14px",
    marginBottom: "10px",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  };

  const errorStyle = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
  };

  const requiredStyle = {
    color: "#ef4444",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* お名前（漢字） */}
      <div style={fieldStyle}>
        <div style={labelStyle}>
          お名前（漢字） <span style={requiredStyle}>*</span>
        </div>
        <input
          {...register("nameKanji")}
          type="text"
          id="nameKanji"
          style={inputStyle}
          placeholder="山田太郎"
        />
        {errors.nameKanji && (
          <div style={errorStyle}>{errors.nameKanji.message}</div>
        )}
      </div>

      {/* オナマエ（カタカナ） */}
      <div style={fieldStyle}>
        <div style={labelStyle}>
          オナマエ（カタカナ） <span style={requiredStyle}>*</span>
        </div>
        <input
          {...register("nameKatakana")}
          type="text"
          id="nameKatakana"
          style={inputStyle}
          placeholder="ヤマダタロウ"
        />
        {errors.nameKatakana && (
          <div style={errorStyle}>{errors.nameKatakana.message}</div>
        )}
      </div>

      {/* 電話番号 */}
      <div style={fieldStyle}>
        <div style={labelStyle}>
          電話番号 <span style={requiredStyle}>*</span>
        </div>
        <input
          {...register("phoneNumber")}
          type="tel"
          id="phoneNumber"
          style={inputStyle}
          placeholder="090-1234-5678"
        />
        {errors.phoneNumber && (
          <div style={errorStyle}>{errors.phoneNumber.message}</div>
        )}
      </div>

      {/* 会社名・屋号 */}
      <div style={fieldStyle}>
        <div style={labelStyle}>
          会社名・屋号（※ない場合は個人名） <span style={requiredStyle}>*</span>
        </div>
        <input
          {...register("companyName")}
          type="text"
          id="companyName"
          style={inputStyle}
          placeholder="株式会社サンプル"
        />
        {errors.companyName && (
          <div style={errorStyle}>{errors.companyName.message}</div>
        )}
      </div>

      {/* メールアドレス */}
      <div style={fieldStyle}>
        <div style={labelStyle}>
          メールアドレス <span style={requiredStyle}>*</span>
        </div>
        <input
          {...register("email")}
          type="email"
          id="email"
          style={inputStyle}
          placeholder="example@email.com"
        />
        {errors.email && <div style={errorStyle}>{errors.email.message}</div>}
      </div>

      {/* 生年月日 */}
      <div style={fieldStyle}>
        <div style={labelStyle}>
          生年月日 <span style={requiredStyle}>*</span>
        </div>
        <input
          {...register("birthDate")}
          type="date"
          id="birthDate"
          style={inputStyle}
        />
        {errors.birthDate && (
          <div style={errorStyle}>{errors.birthDate.message}</div>
        )}
      </div>

      {/* 送信ボタン */}
      <div style={{ paddingTop: "24px" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            backgroundColor: isSubmitting ? "#9ca3af" : "#2563eb",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "16px",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2
                style={{
                  width: "20px",
                  height: "20px",
                  animation: "spin 1s linear infinite",
                }}
              />
              送信中...
            </>
          ) : (
            "登録する"
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </form>
  );
}
