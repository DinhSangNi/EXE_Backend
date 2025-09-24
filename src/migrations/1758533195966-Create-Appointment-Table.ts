import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentTable1758533195966 implements MigrationInterface {
  name = 'CreateAppointmentTable1758533195966';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`appointments\` (
                \`id\` varchar(36) NOT NULL,
                \`date\` varchar(255) NOT NULL,
                \`time\` varchar(255) NOT NULL,
                \`status\` enum ('pending', 'confirmed', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
                \`note\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                \`hostId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            ADD CONSTRAINT \`FK_appointments_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            ADD CONSTRAINT \`FK_appointments_host\` FOREIGN KEY (\`hostId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_appointments_host\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_appointments_user\``,
    );
    await queryRunner.query(`DROP TABLE \`appointments\``);
  }
}
