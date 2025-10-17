import { DataSource } from "typeorm";
import { LineRegistration } from "../entities/lineRegistration.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USERNAME || "develop",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "line_official_register",
  synchronize: true, // 一時的にテーブル自動作成を有効化
  logging: process.env.NODE_ENV === "development",
  entities: [LineRegistration],
  timezone: "Z", // UTC時間を明示的に指定
  extra: {
    socketPath: process.env.DB_HOST?.includes("/cloudsql/")
      ? process.env.DB_HOST
      : undefined,
  },
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("データベース接続が成功しました");
    } catch (error) {
      console.error("データベース接続エラー:", error);
      throw error;
    }
  }
}
