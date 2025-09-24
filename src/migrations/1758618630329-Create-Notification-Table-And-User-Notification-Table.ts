import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTableAndUserNotificationTable1758618630329
  implements MigrationInterface
{
  name = 'CreateNotificationTableAndUserNotificationTable1758618630329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // notifications
    await queryRunner.query(`
            CREATE TABLE \`notifications\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`message\` varchar(255) NOT NULL,
                \`type\` enum ('appointment', 'message', 'system') NOT NULL DEFAULT 'system',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    // user_notifications
    await queryRunner.query(`
            CREATE TABLE \`user_notifications\` (
                \`id\` varchar(36) NOT NULL,
                \`isRead\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                \`notificationId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    // FK user_notifications.userId -> users.id
    await queryRunner.query(`
            ALTER TABLE \`user_notifications\`
            ADD CONSTRAINT \`FK_user_notifications_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`)
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    // FK user_notifications.notificationId -> notifications.id
    await queryRunner.query(`
            ALTER TABLE \`user_notifications\`
            ADD CONSTRAINT \`FK_user_notifications_notification\`
            FOREIGN KEY (\`notificationId\`) REFERENCES \`notifications\`(\`id\`)
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_user_notifications_notification\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_user_notifications_user\``,
    );
    await queryRunner.query(`DROP TABLE \`user_notifications\``);
    await queryRunner.query(`DROP TABLE \`notifications\``);
  }
}
