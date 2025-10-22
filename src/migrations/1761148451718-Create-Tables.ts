import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1761148451718 implements MigrationInterface {
    name = 'CreateTables1761148451718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`medias\` (\`id\` varchar(36) NOT NULL, \`public_id\` varchar(255) NULL, \`name\` varchar(255) NULL, \`url\` varchar(255) NOT NULL, \`type\` varchar(255) NULL, \`purpose\` enum ('avatar', 'room_image', 'room_video') NULL, \`temporary\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`userId\` varchar(36) NULL, \`postId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_notifications\` (\`id\` varchar(36) NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`notificationId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, \`type\` enum ('appointment', 'message', 'system') NOT NULL DEFAULT 'system', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_appointments\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`notificationId\` varchar(36) NULL, \`appointmentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`appointment_posts\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`appointmentId\` varchar(36) NULL, \`postId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`appointments\` (\`id\` varchar(36) NOT NULL, \`appointmentDateTime\` timestamp NOT NULL, \`status\` enum ('pending', 'confirmed', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending', \`note\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`hostId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`phone\` varchar(10) NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`parentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`city\` varchar(255) NOT NULL, \`district\` varchar(255) NOT NULL, \`ward\` varchar(255) NULL, \`street\` varchar(255) NULL, \`latitude\` float NOT NULL, \`longitude\` float NOT NULL, \`square\` float NOT NULL, \`price\` float NOT NULL, \`status\` enum ('pending', 'approved', 'rejected', 'expired') NOT NULL DEFAULT 'pending', \`expiredAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`categoryId\` varchar(36) NULL, \`ownerId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post_amenities\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`postId\` varchar(36) NULL, \`amenityId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`amenities\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`medias\` ADD CONSTRAINT \`FK_0ca422a52c318ce86181dbf01ed\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`medias\` ADD CONSTRAINT \`FK_ca0a94a1fc09f86dada24760f0f\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_notifications\` ADD CONSTRAINT \`FK_cb22b968fe41a9f8b219327fde8\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_notifications\` ADD CONSTRAINT \`FK_01a2c65f414d36cfe6f5d950fb2\` FOREIGN KEY (\`notificationId\`) REFERENCES \`notifications\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_appointments\` ADD CONSTRAINT \`FK_fc34d644b56ddf1fd3e8f529a56\` FOREIGN KEY (\`notificationId\`) REFERENCES \`notifications\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_appointments\` ADD CONSTRAINT \`FK_bc779e7468d96dd37df0ae8d289\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointment_posts\` ADD CONSTRAINT \`FK_234a3f3f601009b000ce1f9496c\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointment_posts\` ADD CONSTRAINT \`FK_5c7280bd4f9e40987f336ac355b\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_01733651151c8a1d6d980135cc4\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_f3f19185f08bc842327cae1ed6d\` FOREIGN KEY (\`hostId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_9a6f051e66982b5f0318981bcaa\` FOREIGN KEY (\`parentId\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_168bf21b341e2ae340748e2541d\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_0e33434a2d18c89a149c8ad6d86\` FOREIGN KEY (\`ownerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post_amenities\` ADD CONSTRAINT \`FK_ef491dd7c4811d611d8f51b3928\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post_amenities\` ADD CONSTRAINT \`FK_c65c136fa900ea624cd9d998a7f\` FOREIGN KEY (\`amenityId\`) REFERENCES \`amenities\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post_amenities\` DROP FOREIGN KEY \`FK_c65c136fa900ea624cd9d998a7f\``);
        await queryRunner.query(`ALTER TABLE \`post_amenities\` DROP FOREIGN KEY \`FK_ef491dd7c4811d611d8f51b3928\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_0e33434a2d18c89a149c8ad6d86\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_168bf21b341e2ae340748e2541d\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_9a6f051e66982b5f0318981bcaa\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_f3f19185f08bc842327cae1ed6d\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_01733651151c8a1d6d980135cc4\``);
        await queryRunner.query(`ALTER TABLE \`appointment_posts\` DROP FOREIGN KEY \`FK_5c7280bd4f9e40987f336ac355b\``);
        await queryRunner.query(`ALTER TABLE \`appointment_posts\` DROP FOREIGN KEY \`FK_234a3f3f601009b000ce1f9496c\``);
        await queryRunner.query(`ALTER TABLE \`notification_appointments\` DROP FOREIGN KEY \`FK_bc779e7468d96dd37df0ae8d289\``);
        await queryRunner.query(`ALTER TABLE \`notification_appointments\` DROP FOREIGN KEY \`FK_fc34d644b56ddf1fd3e8f529a56\``);
        await queryRunner.query(`ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_01a2c65f414d36cfe6f5d950fb2\``);
        await queryRunner.query(`ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_cb22b968fe41a9f8b219327fde8\``);
        await queryRunner.query(`ALTER TABLE \`medias\` DROP FOREIGN KEY \`FK_ca0a94a1fc09f86dada24760f0f\``);
        await queryRunner.query(`ALTER TABLE \`medias\` DROP FOREIGN KEY \`FK_0ca422a52c318ce86181dbf01ed\``);
        await queryRunner.query(`DROP TABLE \`amenities\``);
        await queryRunner.query(`DROP TABLE \`post_amenities\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`appointments\``);
        await queryRunner.query(`DROP TABLE \`appointment_posts\``);
        await queryRunner.query(`DROP TABLE \`notification_appointments\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`DROP TABLE \`user_notifications\``);
        await queryRunner.query(`DROP TABLE \`medias\``);
    }

}
