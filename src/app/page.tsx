import RegisterForm from "@/components/RegisterForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              LINE公式アカウント登録
            </h1>
            <p className="text-gray-600">以下のフォームにご記入ください</p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
