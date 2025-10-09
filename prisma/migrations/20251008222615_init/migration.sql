-- CreateTable
CREATE TABLE "line_registrations" (
    "id" TEXT NOT NULL,
    "nameKanji" TEXT NOT NULL,
    "nameKatakana" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_registrations_pkey" PRIMARY KEY ("id")
);
