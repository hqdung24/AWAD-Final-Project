import { appConfig } from '@/config/app.config';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { EMAIL_TEMPLATES, EMAIL_SUBJECTS } from '../constant/email.constant';
import { Resend } from 'resend';
@Injectable()
export class EmailProvider {
  constructor(
    //app config
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  getEmailContent = (
    template: string,
    link: string,
    toUser: string,
  ): string => {
    let content = template;

    if (template === EMAIL_TEMPLATES.PASSWORD_RESET) {
      content = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px; text-align: center;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #D946EF; color: white; padding: 20px; font-size: 22px; font-weight: bold;">
        Bus Ticket Booking – Password Reset
      </div>
      <div style="padding: 30px; color: #333; text-align: left;">
        <h2 style="margin-bottom: 10px;">Hi, ${toUser} 👋</h2>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password. Click the button below to set a new password for your account. This link will expire in 1 hour.
        </p>

        <div style="text-align:center; margin: 20px 0;">
          <a href="${link}" style="display: inline-block; background-color: #D946EF; color: #fff; padding: 12px 22px; text-decoration: none; border-radius: 6px; font-weight: 700;">Reset My Password</a>
        </div>

        <p style="font-size: 13px; color: #666; margin-top: 8px;">
          If the button doesn't work, copy and paste the following URL into your browser:
        </p>
        <p style="word-break: break-all; font-size: 13px; color: #026AA7;">${link}</p>

        <p style="font-size: 13px; color: #777; margin-top: 18px;">
          If you did not request a password reset, you can safely ignore this email or contact our support.
        </p>
      </div>

      <div style="background-color: #f0f0f0; color: #555; font-size: 12px; padding: 15px; text-align: center;">
        © ${new Date().getFullYear()} Bus Ticket Booking. All rights reserved.<br/>
        This email was sent automatically – please do not reply.
      </div>
    </div>
  </div>
  `;
    } else if (template === EMAIL_TEMPLATES.VERIFICATION) {
      content = `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f4f6f8;
    padding: 30px;
    text-align: center;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    ">
      <div style="
        background-color: #026AA7;
        color: white;
        padding: 20px;
        font-size: 22px;
        font-weight: bold;
      ">
        Bus Ticket Booking – Email Verification
      </div>
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-bottom: 10px;">Welcome, ${toUser} 👋</h2>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          Thank you for signing up for <strong>Bus Ticket Booking</strong>!  
          Please verify your email address to activate your account.
        </p>

        <a href="${link}" 
          style="
            display: inline-block;
            background-color: #026AA7;
            color: #fff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">
          Verify My Email
        </a>

        <p style="margin-top: 25px; font-size: 13px; color: #777;">
          Or copy this link and paste it into your browser:<br/>
          <a href="${link}" style="color: #026AA7; word-break: break-all;">
            ${link}
          </a>
        </p>
      </div>

    <div style="background-color: #f0f0f0; color: #555; font-size: 12px; padding: 15px; text-align: center;">
        © ${new Date().getFullYear()} Bus Ticket Booking. All rights reserved.<br/>
        This email was sent automatically – please do not reply.
    </div>
    </div>
  </div>
`;
    }
    return content;
  };

  sendEmail = async (
    toAddress: string, //user email address
    toName: string, //username
    template: string, // email template
    verificationToken?: string,
  ): Promise<void> => {
    const resend = new Resend(this.appConfiguration.resendApiKey);
    const link = `https://${this.appConfiguration.host}/auth/verification?email=${encodeURIComponent(toAddress)}&token=${encodeURIComponent(
      verificationToken || '',
    )}`;
    const emailContent = this.getEmailContent(template, link, toName);
    const subject =
      template === EMAIL_TEMPLATES.PASSWORD_RESET
        ? EMAIL_SUBJECTS.PASSWORD_RESET
        : EMAIL_SUBJECTS.VERIFICATION;

    await resend.emails.send({
      from: `${this.appConfiguration.adminEmailName} <${this.appConfiguration.adminEmailAddress}>`,
      to: toAddress,
      subject: subject,
      html: emailContent,
    });
  };
}
