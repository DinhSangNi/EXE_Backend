import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentPostTable1758686253365
  implements MigrationInterface
{
  name = 'CreateAppointmentPostTable1758686253365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng appointment_posts
    await queryRunner.query(`
            CREATE TABLE \`appointment_posts\` (
                \`id\` varchar(36) NOT NULL,
                \`appointmentId\` varchar(36) NULL,
                \`postId\` varchar(36) NULL,
                \`note\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    // Thêm foreign key appointmentId → appointments.id
    await queryRunner.query(`
            ALTER TABLE \`appointment_posts\`
            ADD CONSTRAINT \`FK_appointment\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    // Thêm foreign key postId → posts.id
    await queryRunner.query(`
            ALTER TABLE \`appointment_posts\`
            ADD CONSTRAINT \`FK_post\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys trước khi drop table
    await queryRunner.query(
      `ALTER TABLE \`appointment_posts\` DROP FOREIGN KEY \`FK_post\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`appointment_posts\` DROP FOREIGN KEY \`FK_appointment\``,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE \`appointment_posts\``);
  }
}
