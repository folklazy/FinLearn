import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = process.env.EMAIL_FROM ?? 'FinLearn <noreply@finlearn.app>';

export async function sendVerificationEmail(email: string, otp: string) {
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `${otp} คือรหัสยืนยัน FinLearn ของคุณ`,
        html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 24px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#18181f;border:1px solid #2a2a35;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c6cf0,#a78bfa);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <span style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;font-size:20px;font-weight:800;color:#fff;">F</span>
              <span style="font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-0.02em;">FinLearn</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:1.3rem;font-weight:700;color:#f0f0f5;">รหัสยืนยันอีเมล</h1>
            <p style="margin:0 0 28px;color:#8b8b9e;font-size:0.9rem;line-height:1.7;">
              กรอกรหัสนี้ในหน้ายืนยันอีเมล<br/>
              รหัสจะหมดอายุใน <strong style="color:#c4c4d4;">15 นาที</strong>
            </p>
            <div style="background:#0f0f13;border:2px solid #7c6cf0;border-radius:14px;padding:24px 32px;display:inline-block;margin-bottom:28px;">
              <span style="font-size:2.6rem;font-weight:800;letter-spacing:0.25em;color:#a78bfa;font-variant-numeric:tabular-nums;">${otp}</span>
            </div>
            <p style="margin:0;color:#5a5a6e;font-size:0.78rem;line-height:1.6;">
              ถ้าคุณไม่ได้สมัครสมาชิก FinLearn สามารถเพิกเฉยอีเมลนี้ได้เลย
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
}

export async function sendEmailChangeOtp(newEmail: string, otp: string) {
    await transporter.sendMail({
        from: FROM,
        to: newEmail,
        subject: `${otp} คือรหัสยืนยันการเปลี่ยนอีเมล FinLearn`,
        html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 24px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#18181f;border:1px solid #2a2a35;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c6cf0,#a78bfa);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <span style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;font-size:20px;font-weight:800;color:#fff;">F</span>
              <span style="font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-0.02em;">FinLearn</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:1.3rem;font-weight:700;color:#f0f0f5;">ยืนยันการเปลี่ยนอีเมล</h1>
            <p style="margin:0 0 28px;color:#8b8b9e;font-size:0.9rem;line-height:1.7;">
              กรอกรหัสนี้เพื่อยืนยันอีเมลใหม่ของคุณ<br/>
              รหัสจะหมดอายุใน <strong style="color:#c4c4d4;">15 นาที</strong>
            </p>
            <div style="background:#0f0f13;border:2px solid #7c6cf0;border-radius:14px;padding:24px 32px;display:inline-block;margin-bottom:28px;">
              <span style="font-size:2.6rem;font-weight:800;letter-spacing:0.25em;color:#a78bfa;font-variant-numeric:tabular-nums;">${otp}</span>
            </div>
            <p style="margin:0;color:#5a5a6e;font-size:0.78rem;line-height:1.6;">
              ถ้าคุณไม่ได้ขอเปลี่ยนอีเมล สามารถเพิกเฉยอีเมลนี้ได้เลย
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
}

export async function sendPasswordResetEmail(email: string, otp: string) {
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `${otp} คือรหัสรีเซ็ตรหัสผ่าน FinLearn ของคุณ`,
        html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 24px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#18181f;border:1px solid #2a2a35;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c6cf0,#a78bfa);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <span style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;font-size:20px;font-weight:800;color:#fff;">F</span>
              <span style="font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-0.02em;">FinLearn</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:1.3rem;font-weight:700;color:#f0f0f5;">รหัสรีเซ็ตรหัสผ่าน</h1>
            <p style="margin:0 0 28px;color:#8b8b9e;font-size:0.9rem;line-height:1.7;">
              กรอกรหัสนี้ในหน้ารีเซ็ตรหัสผ่าน<br/>
              รหัสจะหมดอายุใน <strong style="color:#c4c4d4;">15 นาที</strong>
            </p>
            <div style="background:#0f0f13;border:2px solid #7c6cf0;border-radius:14px;padding:24px 32px;display:inline-block;margin-bottom:28px;">
              <span style="font-size:2.6rem;font-weight:800;letter-spacing:0.25em;color:#a78bfa;font-variant-numeric:tabular-nums;">${otp}</span>
            </div>
            <p style="margin:0;color:#5a5a6e;font-size:0.78rem;line-height:1.6;">
              ถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยอีเมลนี้ได้เลย
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
}
