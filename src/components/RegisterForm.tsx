"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2, User } from "lucide-react";

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
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lineUser, setLineUser] = useState<{
    userId?: string;
    displayName?: string;
    pictureUrl?: string;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // LINE情報をチェック
  useEffect(() => {
    const checkLineInfo = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const lineLogin = urlParams.get("lineLogin");
      const lineUserId = urlParams.get("lineUserId");
      const lineDisplayName = urlParams.get("lineDisplayName");
      const linePictureUrl = urlParams.get("linePictureUrl");

      console.log("URL Parameters:", {
        lineLogin,
        lineUserId,
        lineDisplayName,
        linePictureUrl,
      });

      // LINE Loginからの場合
      if (lineLogin === "success" && lineUserId) {
        console.log("LINE Login detected:", lineUserId);
        setLineUser({
          userId: lineUserId,
          displayName: lineDisplayName || undefined,
          pictureUrl: linePictureUrl || undefined,
        });

        // URLからLINE情報パラメータを削除
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("lineLogin");
        newUrl.searchParams.delete("lineUserId");
        newUrl.searchParams.delete("lineDisplayName");
        newUrl.searchParams.delete("linePictureUrl");
        window.history.replaceState({}, "", newUrl.toString());
      }
      // リッチメニューからの場合（LINE IDのみ）
      else if (lineUserId && !lineLogin) {
        console.log("Rich menu detected:", lineUserId);
        // LINE Bot APIでユーザー情報を取得
        try {
          const response = await fetch("/api/line/get-user-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: lineUserId }),
          });

          if (response.ok) {
            const userInfo = await response.json();
            console.log("LINE user info retrieved:", userInfo);
            setLineUser({
              userId: userInfo.userId,
              displayName: userInfo.displayName,
              pictureUrl: userInfo.pictureUrl,
            });
          } else {
            console.error("Failed to get LINE user info:", response.status);
          }
        } catch (error) {
          console.error("Failed to get LINE user info:", error);
        }

        // URLからLINE IDパラメータを削除
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("lineUserId");
        window.history.replaceState({}, "", newUrl.toString());
      } else {
        console.log("No LINE parameters found in URL");
      }
    };

    checkLineInfo();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    console.log("Submitting with LINE user:", lineUser);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          lineUserId: lineUser.userId || null,
          lineDisplayName: lineUser.displayName || null,
          linePictureUrl: lineUser.pictureUrl || null,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        reset();
      } else {
        alert("登録に失敗しました。もう一度お試しください。");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("登録に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">登録完了！</h2>
        <p className="text-gray-600 mb-6">
          ご登録いただき、ありがとうございました。
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新規登録
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* お名前（漢字） */}
        <div>
          <label
            htmlFor="nameKanji"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            お名前（漢字） <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nameKanji")}
            type="text"
            id="nameKanji"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="山田太郎"
          />
          {errors.nameKanji && (
            <p className="mt-1 text-sm text-red-600">
              {errors.nameKanji.message}
            </p>
          )}
        </div>

        {/* オナマエ（カタカナ） */}
        <div>
          <label
            htmlFor="nameKatakana"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            オナマエ（カタカナ） <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nameKatakana")}
            type="text"
            id="nameKatakana"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ヤマダタロウ"
          />
          {errors.nameKatakana && (
            <p className="mt-1 text-sm text-red-600">
              {errors.nameKatakana.message}
            </p>
          )}
        </div>

        {/* 電話番号 */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("phoneNumber")}
            type="tel"
            id="phoneNumber"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="090-1234-5678"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* 会社名・屋号 */}
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            会社名・屋号（※ない場合は個人名）{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            {...register("companyName")}
            type="text"
            id="companyName"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="株式会社サンプル"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* メールアドレス */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* 生年月日 */}
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            生年月日 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("birthDate")}
            type="date"
            id="birthDate"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.birthDate.message}
            </p>
          )}
        </div>

        {/* 送信ボタン */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                送信中...
              </>
            ) : (
              "登録する"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
