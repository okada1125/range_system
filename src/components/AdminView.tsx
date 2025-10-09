"use client";

import { useState } from "react";
import { Download, Eye, EyeOff, User, Loader2 } from "lucide-react";

interface Registration {
  id: string;
  nameKanji: string;
  nameKatakana: string;
  phoneNumber: string;
  companyName: string;
  email: string;
  birthDate: Date;
  lineUserId: string | null;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
  createdAt: Date;
}

interface AdminViewProps {
  registrations: Registration[];
}

export default function AdminView({ registrations }: AdminViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isCreatingRichMenu, setIsCreatingRichMenu] = useState(false);

  const exportToCSV = () => {
    const headers = [
      "登録ID",
      "お名前（漢字）",
      "オナマエ（カタカナ）",
      "電話番号",
      "会社名・屋号",
      "メールアドレス",
      "生年月日",
      "LINEユーザーID",
      "LINE表示名",
      "登録日時",
    ];

    const csvContent = [
      headers.join(","),
      ...registrations.map((reg) =>
        [
          reg.id,
          reg.nameKanji,
          reg.nameKatakana,
          reg.phoneNumber,
          reg.companyName,
          reg.email,
          reg.birthDate.toLocaleDateString("ja-JP"),
          reg.lineUserId || "",
          reg.lineDisplayName || "",
          reg.createdAt.toLocaleString("ja-JP"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `line_registrations_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createRichMenu = async () => {
    setIsCreatingRichMenu(true);
    try {
      // リッチメニューを作成
      const createResponse = await fetch("/api/richmenu/create", {
        method: "POST",
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create rich menu");
      }

      const createResult = await createResponse.json();

      // リッチメニューを設定
      const setResponse = await fetch("/api/richmenu/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ richMenuId: createResult.richMenuId }),
      });

      if (!setResponse.ok) {
        throw new Error("Failed to set rich menu");
      }

      alert("リッチメニューが正常に作成・設定されました！");
    } catch (error) {
      console.error("Rich menu creation error:", error);
      alert(
        "リッチメニューの作成に失敗しました。環境変数の設定を確認してください。"
      );
    } finally {
      setIsCreatingRichMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LINE公式登録データ管理
              </h1>
              <p className="text-gray-600 mt-1">
                総登録数: {registrations.length}件
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createRichMenu}
                disabled={isCreatingRichMenu}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRichMenu ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                {isCreatingRichMenu ? "作成中..." : "リッチメニュー作成"}
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV出力
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showDetails ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showDetails ? "詳細を非表示" : "詳細を表示"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    お名前（漢字）
                  </th>
                  {showDetails && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        オナマエ（カタカナ）
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        電話番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        会社名・屋号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        生年月日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LINE情報
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.createdAt.toLocaleString("ja-JP")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registration.nameKanji}
                    </td>
                    {showDetails && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.nameKatakana}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.birthDate.toLocaleDateString("ja-JP")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.lineUserId ? (
                            <div className="flex items-center space-x-2">
                              {registration.linePictureUrl && (
                                <img
                                  src={registration.linePictureUrl}
                                  alt="LINE Profile"
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className="text-green-600 font-medium">
                                {registration.lineDisplayName ||
                                  registration.lineUserId}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">未連携</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {registrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                まだ登録データがありません
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
