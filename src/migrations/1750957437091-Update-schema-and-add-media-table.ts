import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMediaAndRelations implements MigrationInterface {
  name = 'UpdateMediaAndRelations1750957437091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change ID types to UUIDs
    await queryRunner.query(
      `ALTER TABLE \`amenities\` MODIFY COLUMN \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` MODIFY COLUMN \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rooms\` MODIFY COLUMN \`id\` varchar(36) NOT NULL`,
    );

    // Create Media table
    await queryRunner.query(`
            CREATE TABLE \`medias\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`url\` varchar(255) NOT NULL,
                \`type\` enum ('image', 'video') NULL,
                \`purpose\` enum ('avatar', 'room_image', 'room_video') NULL,
                \`roomId\` varchar(36) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    // Add avatarId to users table
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`avatarId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_users_avatar\` FOREIGN KEY (\`avatarId\`) REFERENCES \`medias\`(\`id\`) ON DELETE SET NULL`,
    );

    // Add OneToMany relation in rooms -> medias
    await queryRunner.query(
      `ALTER TABLE \`medias\` ADD CONSTRAINT \`FK_medias_room\` FOREIGN KEY (\`roomId\`) REFERENCES \`rooms\`(\`id\`) ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`medias\` DROP FOREIGN KEY \`FK_medias_room\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_avatar\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatarId\``);
    await queryRunner.query(`DROP TABLE \`medias\``);
    // Optional: You can change back to INT if needed, but skipped here
  }
}
