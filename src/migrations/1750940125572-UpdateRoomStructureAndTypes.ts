import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateRoomStructureAndTypes implements MigrationInterface {
  name = 'UpdateRoomStructureAndTypes1750940125572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột roomType
    await queryRunner.query(`ALTER TABLE \`rooms\` DROP COLUMN \`roomType\``);

    // Thêm enum propertyType
    await queryRunner.query(
      `ALTER TABLE \`rooms\` ADD \`propertyType\` enum ('Chung cư', 'Nhà trọ', 'Nhà nguyên căn') NOT NULL`,
    );

    // Thêm enum rentalType
    await queryRunner.query(
      `ALTER TABLE \`rooms\` ADD \`rentalType\` enum ('Nguyên căn', 'Từng phòng') NOT NULL`,
    );

    // Chỉnh sửa cột ward và street thành NULLABLE
    await queryRunner.query(
      `ALTER TABLE \`rooms\` MODIFY \`ward\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rooms\` MODIFY \`street\` varchar(255) NULL`,
    );

    // Thêm cột square
    await queryRunner.query(
      `ALTER TABLE \`rooms\` ADD \`square\` float NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các cột mới
    await queryRunner.query(`ALTER TABLE \`rooms\` DROP COLUMN \`square\``);
    await queryRunner.query(`ALTER TABLE \`rooms\` DROP COLUMN \`rentalType\``);
    await queryRunner.query(
      `ALTER TABLE \`rooms\` DROP COLUMN \`propertyType\``,
    );

    // Thêm lại cột roomType
    await queryRunner.query(
      `ALTER TABLE \`rooms\` ADD \`roomType\` enum ('Chung cư', 'Nhà trọ', 'Nhà nguyên căn') NOT NULL`,
    );

    // Trả lại ward và street về NOT NULL
    await queryRunner.query(
      `ALTER TABLE \`rooms\` MODIFY \`ward\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rooms\` MODIFY \`street\` varchar(255) NOT NULL`,
    );
  }
}
