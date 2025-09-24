import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppointmentTableCombineToAppointmentDateTime1758609685375
  implements MigrationInterface
{
  name = 'UpdateAppointmentTableCombineToAppointmentDateTime1758609685375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm cột mới
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            ADD COLUMN \`appointmentDateTime\` timestamp NULL
        `);

    // 2. Convert dữ liệu từ date + time sang appointmentDateTime
    await queryRunner.query(`
            UPDATE \`appointments\`
            SET \`appointmentDateTime\` = STR_TO_DATE(CONCAT(\`date\`, ' ', \`time\`), '%Y-%m-%d %H:%i:%s')
        `);

    // 3. Đặt NOT NULL (sau khi đã fill dữ liệu)
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            MODIFY \`appointmentDateTime\` timestamp NOT NULL
        `);

    // 4. Xoá 2 cột cũ
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            DROP COLUMN \`date\`,
            DROP COLUMN \`time\`
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm lại cột date và time
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            ADD COLUMN \`date\` varchar(255) NULL,
            ADD COLUMN \`time\` varchar(255) NULL
        `);

    // 2. Convert ngược từ appointmentDateTime
    await queryRunner.query(`
            UPDATE \`appointments\`
            SET \`date\` = DATE(\`appointmentDateTime\`),
                \`time\` = TIME(\`appointmentDateTime\`)
        `);

    // 3. Xoá cột mới
    await queryRunner.query(`
            ALTER TABLE \`appointments\`
            DROP COLUMN \`appointmentDateTime\`
        `);
  }
}
