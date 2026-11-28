import { emailLayout } from "./layout";

export function resetPasswordTemplate(resetLink: string, expiryTime: number) {
  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 10px;">Password Reset Request</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">
      We received a request to reset the password for your <strong>Workzy</strong> account. Click the button below to choose a new password:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}"
         style="display: inline-block; padding: 12px 26px; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; border-radius: 8px; text-decoration: none;">
        Reset Password
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 12px;">
      This link is valid for <strong>${expiryTime} minutes</strong>. If you did not request a password reset, you can safely ignore this email.
    </p>
  `;

  return emailLayout(content);
}
