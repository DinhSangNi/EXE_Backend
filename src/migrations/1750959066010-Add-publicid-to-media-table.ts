import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicidToMediaTable1750959066010
  implements MigrationInterface
{
  name = 'AddPublicidToMediaTable1750959066010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xoá cột enum cũ (nếu đang là enum)
    await queryRunner.query(`
      ALTER TABLE \`medias\`
      DROP COLUMN \`type\`
    `);

    // Thêm lại cột type dạng string
    await queryRunner.query(`
      ALTER TABLE \`medias\`
      ADD \`type\` varchar(255) NULL
    `);

    // Thêm cột public_id
    await queryRunner.query(`
      ALTER TABLE \`medias\`
      ADD \`public_id\` varchar(255) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xoá cột public_id
    await queryRunner.query(`
      ALTER TABLE \`medias\`
      DROP COLUMN \`public_id\`
    `);

    // Xoá cột type mới
    await queryRunner.query(`
      ALTER TABLE \`medias\`
      DROP COLUMN \`type\`
    `);

    // Thêm lại cột type kiểu enum (nếu bạn muốn rollback về enum)
    await queryRunner.query(`
      ALTER TABLE \`medias\`
      ADD \`type\` enum ('image', 'video') NULL
    `);
  }
}
