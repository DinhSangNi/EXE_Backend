import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendOtpDto } from 'src/dto/request/send-otp.dto';
import { Notification } from 'src/entity/notification.entity';

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

  async sendBookingSuccessMail(
    userEmail: string,
    hostEmail: string,
    notification: Notification,
  ) {
    console.log('notification: ', notification);
    const appointment =
      notification?.notificationAppointments?.[0]?.appointment;
    const post = appointment?.appointmentPosts?.[0]?.post;

    if (!appointment || !post) return;

    const formattedDate = new Date(
      appointment.appointmentDateTime,
    ).toLocaleString('vi-VN');

    // Nội dung chung
    const subject = 'Xác nhận đặt lịch thành công';
    const htmlContent = `
      <h2>Xin chào,</h2>
      <p>Bạn vừa đặt lịch thành công!</p>
      <p><strong>Tiêu đề thông báo:</strong> ${notification.title}</p>
      <p><strong>Nội dung:</strong> ${notification.message}</p>

      <h3>Chi tiết lịch hẹn:</h3>
      <ul>
        <li><strong>Bài đăng:</strong> ${post.title}</li>
        <li><strong>Thời gian:</strong> ${formattedDate}</li>
        <li><strong>Trạng thái:</strong> ${appointment.status}</li>
      </ul>

      <p>Cảm ơn bạn đã sử dụng UHome.</p>
    `;

    console.log('userMail: ', userEmail);
    console.log('hostmail: ', hostEmail);

    // Gửi cho user
    await this.transporter.sendMail({
      from: `"UHome" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    // Gửi cho host
    await this.transporter.sendMail({
      from: `"UHome" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: hostEmail,
      subject,
      html: htmlContent.replace(
        '<p>Bạn vừa đặt lịch thành công!</p>',
        '<p>Bạn vừa nhận được một lịch hẹn mới từ người dùng.</p>',
      ),
    });
  }
}
