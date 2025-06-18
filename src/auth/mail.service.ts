import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configService.get<string>('EMAIL_USER'),
        pass: configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: `"UHome <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã OTP xác thực của bạn',
      html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Hiệu lực trong 5 phút.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
