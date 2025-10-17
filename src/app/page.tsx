import RegisterForm from "@/components/RegisterForm";

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px 20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0px 1px 12px 1px rgba(0,0,0,0.05)",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <RegisterForm />
      </div>
    </div>
  );
}
