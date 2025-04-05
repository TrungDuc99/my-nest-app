import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1712405000000 implements MigrationInterface {
  name = 'InitialMigration1712405000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(100) NOT NULL UNIQUE,
        "fullName" varchar(100) NOT NULL,
        "password" varchar NOT NULL,
        "role" varchar DEFAULT 'user',
        "avatarUrl" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Tạo bảng projects
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "description" text,
        "status" varchar DEFAULT 'active',
        "ownerId" uuid NOT NULL,
        "startDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_projects_users" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Tạo bảng tasks
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(200) NOT NULL,
        "description" text,
        "status" varchar DEFAULT 'pending',
        "priority" varchar DEFAULT 'medium',
        "assigneeId" uuid,
        "creatorId" uuid NOT NULL,
        "projectId" uuid NOT NULL,
        "dueDate" TIMESTAMP,
        "estimatedHours" integer DEFAULT 0,
        "spentHours" integer DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_creator" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_project" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);

    // Tạo bảng task_comments
    await queryRunner.query(`
      CREATE TABLE "task_comments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "userId" uuid NOT NULL,
        "taskId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_task_comments_user" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_comments_task" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE
      )
    `);

    // Thêm extension để sử dụng UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_comments"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
