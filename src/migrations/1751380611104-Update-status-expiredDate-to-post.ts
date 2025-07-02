import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStatusExpiredDateToPost1751380611104 implements MigrationInterface {
    name = 'UpdateStatusExpiredDateToPost1751380611104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`status\` enum ('pending', 'approved', 'rejected', 'expired') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`expiredAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('user', 'admin') NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`expiredAt\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`deletedAt\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`isActive\` tinyint NOT NULL DEFAULT '1'`);
    }

}
