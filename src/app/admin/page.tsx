import { prisma } from "@/lib/prisma";
import AdminView from "@/components/AdminView";

export default async function AdminPage() {
  const registrations = await prisma.lineRegistration.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return <AdminView registrations={registrations} />;
}
