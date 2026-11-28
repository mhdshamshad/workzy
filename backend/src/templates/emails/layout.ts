const WORKZY_LOGO_URL =
  "https://workzy-app-storage.s3.ap-south-1.amazonaws.com/public/home/workzy-icon-logo.png";

export function emailLayout(content: string) {
  return `
    <div style="background-color: #f8fafc; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
      <div style="max-width: 540px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px;">
        <div style="padding-bottom: 18px; margin-bottom: 22px; border-bottom: 1px solid #e2e8f0;">
          <img
            src="${WORKZY_LOGO_URL}"
            alt="Workzy"
            width="30"
            height="30"
            style="vertical-align: middle; border-radius: 6px; margin-right: 10px; display: inline-block;"
          />
          <span style="font-size: 18px; font-weight: 700; color: #0f172a; vertical-align: middle;">
            Workzy
          </span>
        </div>

        <div>
          ${content}
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
          Workzy &bull; Automated Security Notification &copy; ${new Date().getFullYear()}
        </p>
      </div>
    </div>
  `;
}
