import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentNotificationTable1758689463728
  implements MigrationInterface
{
  name = 'CreateAppointmentNotificationTable1758689463728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`notification_appointments\` (
                \`id\` varchar(36) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`notificationId\` varchar(36) NULL,
                \`appointmentId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    await queryRunner.query(`
  ALTER TABLE \`notification_appointments\`
  ADD CONSTRAINT \`FK_notification_appointments_notification\` FOREIGN KEY (\`notificationId\`) REFERENCES \`notifications\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
`);

    await queryRunner.query(`
  ALTER TABLE \`notification_appointments\`
  ADD CONSTRAINT \`FK_notification_appointments_appointment\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`notification_appointments\` DROP FOREIGN KEY \`FK_appointment\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`notification_appointments\` DROP FOREIGN KEY \`FK_notification\`
        `);
    await queryRunner.query(`
            DROP TABLE \`notification_appointments\`
        `);
  }
}
