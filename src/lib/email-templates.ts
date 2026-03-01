const baseStyle = `
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

const headerStyle = `
  padding: 32px 40px;
  border-bottom: 1px solid #f0f0f0;
`;

const bodyStyle = `
  padding: 40px;
`;

const footerStyle = `
  padding: 24px 40px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  color: #999;
  font-size: 12px;
`;

const btnStyle = `
  display: inline-block;
  padding: 14px 32px;
  background: #2563EB;
  color: #ffffff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
`;

export function proposalEmailTemplate({
    customerName,
    subject,
    total,
    currency,
    validUntil,
    proposalNo,
    link,
}: {
    customerName: string;
    subject: string;
    total: string;
    currency: string;
    validUntil: string;
    proposalNo: string;
    link: string;
}) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f5f5f5;">
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0; font-size:22px; font-weight:800; color:#1a1a1a;">
        AKSE<span style="color:#2563EB;">.</span>
      </h1>
      <p style="margin:4px 0 0; font-size:11px; color:#999;">Digital Agency</p>
    </div>
    <div style="${bodyStyle}">
      <p style="font-size:15px; color:#333; margin:0 0 24px;">
        Sayın <strong>${customerName}</strong>,
      </p>
      <p style="font-size:14px; color:#666; line-height:1.6; margin:0 0 24px;">
        <strong>${subject || "Hizmet"}</strong> kapsamında hazırladığımız teklifi incelemeniz için aşağıdaki butona tıklayabilirsiniz.
      </p>

      <div style="background:#f8f9fa; border-radius:12px; padding:20px; margin:0 0 28px;">
        <table style="width:100%; font-size:13px; color:#555;">
          <tr>
            <td style="padding:4px 0;">Teklif No:</td>
            <td style="text-align:right; font-weight:600; color:#333;">${proposalNo}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;">Toplam:</td>
            <td style="text-align:right; font-weight:700; color:#2563EB; font-size:16px;">${total} ${currency}</td>
          </tr>
          ${validUntil ? `
          <tr>
            <td style="padding:4px 0;">Geçerlilik:</td>
            <td style="text-align:right; font-weight:600; color:#333;">${validUntil}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="text-align:center; margin:0 0 32px;">
        <a href="${link}" style="${btnStyle}">Teklifi Görüntüle →</a>
      </div>

      <p style="font-size:12px; color:#999; line-height:1.5;">
        Bu e-posta Akse Digital tarafından otomatik olarak gönderilmiştir.
      </p>
    </div>
    <div style="${footerStyle}">
      <p style="margin:0;">Akse Digital — aksedigital.com</p>
    </div>
  </div>
</body>
</html>`;
}

export function notificationEmailTemplate({
    title,
    message,
    link,
    buttonText,
}: {
    title: string;
    message: string;
    link?: string;
    buttonText?: string;
}) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f5f5f5;">
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0; font-size:22px; font-weight:800; color:#1a1a1a;">
        AKSE<span style="color:#2563EB;">.</span>
      </h1>
    </div>
    <div style="${bodyStyle}">
      <h2 style="font-size:18px; color:#333; margin:0 0 16px;">${title}</h2>
      <p style="font-size:14px; color:#666; line-height:1.6; margin:0 0 24px; white-space:pre-line;">${message}</p>
      ${link ? `
      <div style="text-align:center;">
        <a href="${link}" style="${btnStyle}">${buttonText || "Görüntüle"}</a>
      </div>` : ""}
    </div>
    <div style="${footerStyle}">
      <p style="margin:0;">Akse Digital — aksedigital.com</p>
    </div>
  </div>
</body>
</html>`;
}
