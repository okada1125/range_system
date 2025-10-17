import "reflect-metadata";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("line_registrations")
export class LineRegistration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  nameKanji!: string;

  @Column({ type: "varchar", length: 100 })
  nameKatakana!: string;

  @Column({ type: "varchar", length: 20 })
  phoneNumber!: string;

  @Column({ type: "varchar", length: 200 })
  companyName!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "date" })
  birthDate!: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  lineUserId?: string;

  @CreateDateColumn({
    type: "timestamp",
    transformer: {
      to: (value: Date) =>
        new Date(value.getTime() + value.getTimezoneOffset() * 60000),
      from: (value: Date) =>
        new Date(value.getTime() - value.getTimezoneOffset() * 60000),
    },
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    transformer: {
      to: (value: Date) =>
        new Date(value.getTime() + value.getTimezoneOffset() * 60000),
      from: (value: Date) =>
        new Date(value.getTime() - value.getTimezoneOffset() * 60000),
    },
  })
  updatedAt!: Date;
}
