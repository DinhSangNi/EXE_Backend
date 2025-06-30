import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoleUserTable1751272692685 implements MigrationInterface {
  name = 'UpdateRoleUserTable1751272692685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Chuyển về varchar để tránh lỗi enum
    await queryRunner.query(`
      ALTER TABLE users MODIFY role VARCHAR(20);
    `);

    // 2. Update dữ liệu
    await queryRunner.query(`
      UPDATE users
      SET role = 'user'
      WHERE role IN ('renter', 'host');
    `);

    // 3. Chuyển về enum mới
    await queryRunner.query(`
      ALTER TABLE users MODIFY role ENUM('user', 'admin') DEFAULT 'user';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down: khôi phục enum cũ
    await queryRunner.query(`
      ALTER TABLE users MODIFY role VARCHAR(20);
    `);

    await queryRunner.query(`
      UPDATE users
      SET role = 'renter'
      WHERE role = 'user';
    `);

    await queryRunner.query(`
      ALTER TABLE users MODIFY role ENUM('renter', 'host', 'admin') DEFAULT 'renter';
    `);
  }
}
