import { injectable } from "inversify";

import logger from "@/config/logger";
import { transporter } from "@/config/nodemailer";
import { NODEMAILER_EMAIL } from "@/constants";
import { IEmailService, SendEmailOptions } from "@/core/interfaces/services/IEmailService";

@injectable()
export class NodemailerEmailService implements IEmailService {
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, text, html, attachments } = options;
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    try {
      await transporter.sendMail({
        from: `"Workzy" <${NODEMAILER_EMAIL}>`,
        to: recipients,
        subject,
        text,
        html,
        attachments,
      });

      logger.info("Email sent successfully", { to: recipients, subject });
      return true;
    } catch (error) {
      logger.error("Failed to send email", { to: recipients, subject, error });
      return false;
    }
  }
}
