import { emailLayout } from "./layout";

export interface OtpEmailTemplateOptions {
  title?: string;
  description?: string;
}

export function otpEmailTemplate(
  otp: string,
  expiryTime: number,
  options: OtpEmailTemplateOptions = {}
) {
  const {
    title = "Verification Code",
    description = "Use the verification code below to continue:",
  } = options;

  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 10px;">${title}</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">${description}</p>

    <div style="text-align: center; margin: 28px 0;">
      <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1d4ed8; background-color: #eff6ff; padding: 14px 26px; border-radius: 8px; border: 1px dashed #bfdbfe;">
        ${otp}
      </span>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
      This code is valid for <strong>${expiryTime} minutes</strong>. If you did not request this, you can safely ignore this email.
    </p>
  `;

  return emailLayout(content);
}
