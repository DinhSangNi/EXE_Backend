import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToNotificationTable1760805708901
  implements MigrationInterface
{
  name = 'AddTypeToNotificationTable1760805708901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột type với enum values và default 'system'
    await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD \`type\` enum('appointment','message','system') NOT NULL DEFAULT 'system'
        `);

    // Thêm các foreign key với cascade nếu cần
    await queryRunner.query(`
            ALTER TABLE \`user_notifications\`
            ADD CONSTRAINT \`FK_cb22b968fe41a9f8b219327fde8\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`user_notifications\`
            ADD CONSTRAINT \`FK_01a2c65f414d36cfe6f5d950fb2\` FOREIGN KEY (\`notificationId\`) REFERENCES \`notifications\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`notification_appointments\`
            ADD CONSTRAINT \`FK_fc34d644b56ddf1fd3e8f529a56\` FOREIGN KEY (\`notificationId\`) REFERENCES \`notifications\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`notification_appointments\`
            ADD CONSTRAINT \`FK_bc779e7468d96dd37df0ae8d289\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    // Ví dụ cascade trên bảng appointment_posts
    await queryRunner.query(`
            ALTER TABLE \`appointment_posts\`
            ADD CONSTRAINT \`FK_234a3f3f601009b000ce1f9496c\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`appointment_posts\`
            ADD CONSTRAINT \`FK_5c7280bd4f9e40987f336ac355b\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    // Các foreign key khác của appointments
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            ADD CONSTRAINT \`FK_01733651151c8a1d6d980135cc4\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            ADD CONSTRAINT \`FK_f3f19185f08bc842327cae1ed6d\` FOREIGN KEY (\`hostId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_f3f19185f08bc842327cae1ed6d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_01733651151c8a1d6d980135cc4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`appointment_posts\` DROP FOREIGN KEY \`FK_5c7280bd4f9e40987f336ac355b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`appointment_posts\` DROP FOREIGN KEY \`FK_234a3f3f601009b000ce1f9496c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_appointments\` DROP FOREIGN KEY \`FK_bc779e7468d96dd37df0ae8d289\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_appointments\` DROP FOREIGN KEY \`FK_fc34d644b56ddf1fd3e8f529a56\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_01a2c65f414d36cfe6f5d950fb2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_cb22b968fe41a9f8b219327fde8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP COLUMN \`type\``,
    );
  }
}
