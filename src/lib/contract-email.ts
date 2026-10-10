import type { ContractLocale } from './contract-presentation';

export function contractEmail(locale: ContractLocale) {
  const dir = locale === 'ru' ? 'ltr' : 'rtl';
  const t =
    locale === 'ru'
      ? {
          name: 'Юлия',
          subject: 'Подписанный договор на фотосъёмку',
          text: 'Во вложении подписанный договор. Если у вас есть вопросы, я всегда на связи 😊',
          thanks: 'Спасибо ☺️',
          attached: 'Во вложении подписанный договор на фотосъёмку',
          help: 'Если у вас есть вопросы, напишите мне в WhatsApp или позвоните',
          phone: 'Позвонить',
          signoff: 'С ❤️ Юлия',
          filename: 'Договор-фотосъёмки-Юлия.pdf',
        }
      : {
          name: 'יוליה',
          subject: 'חוזה צילום חתום',
          text: 'מצורף החוזה החתום, לכל שאלה אני תמיד זמינה 😊',
          thanks: 'תודה ☺️',
          attached: 'מצורף חוזה הצילום חתום',
          help: 'לכל שאלה או עניין אני זמינה בווטסאפ או בטלפון',
          phone: 'טלפון',
          signoff: 'ב ❤️ יוליה',
          filename: 'חוזה-צילום-יוליה.pdf',
        };
  return {
    ...t,
    html: `
      
<!DOCTYPE html>
<html lang="${locale}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Email</title>
<style>
  @font-face { font-family: Rubik; src: url(https://yulia.photography/fonts/Rubik-Regular.ttf) format("truetype"); font-weight:400; }
  /* Basic resets */
  body { margin:0; padding:0; background:#f0f1f5; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { display:block; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { color:inherit; text-decoration:none; }

  /* Container */
  .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; }

  /* Top Divider */
  .top_divider { width:60%; height:1px; margin:auto; background:#e00004; line-height:1px; font-size:1px; }

    /* Divider */
  .divider { width:85%; height:1px; margin:auto; background:#e00004; line-height:1px; font-size:1px; }

    /* Hero Image */
  .hero_img { width:100%; max-width:600px; margin:auto; border-radius:20px; }

   /* Logo */
  .logo { width: 30%; max-width: 200px; margin:auto; }

  /* Buttons */
  .btn { display:inline-block; width:100%; max-width:220px; padding:12px 18px; background:#e00004; color:#ffffff !important;
         font-family:${locale === 'ru' ? 'Rubik, ' : ''}Arial, Helvetica, sans-serif; font-size:18px; font-weight:700; text-align:center; border-radius:50px; }
  .btn-wrap { text-align:center; padding:10px 20px; }

  /* Typography */
  .h-large { font-family:${locale === 'ru' ? 'Rubik, ' : ''}Arial, Helvetica, sans-serif; font-size:22px; color:#0e1b10; font-weight:700; }
  .h-medium { font-family:${locale === 'ru' ? 'Rubik, ' : ''}Arial, Helvetica, sans-serif; font-size:18px; color:#0e1b10; font-weight:700; }

  /* Spacing */
  .pad-20 { padding:20px; }
  .pad-10 { padding:10px; }

  /* Footer */
  .footer { width:100%; max-width:600px; margin:0 auto; background:#070300; text-align:center; padding:30px; }

  /* Responsive tweaks */
  @media screen and (max-width:480px) { 
    .h-large { font-size:20px !important; }
    .h-medium { font-size:17px !important; }
    .btn { font-size:16px !important; padding:10px 14px !important; }
  }
</style>
</head>
<body>

<table width="100%" bgcolor="#f0f1f5" cellpadding="0" cellspacing="0" role="presentation">
  <tr><td align="center">

    <table class="container" cellpadding="0" cellspacing="0" role="presentation">
      <!-- Logo row (kept as relative, you can swap with your logo) -->
      <tr>
        <td class="pad-20" style="text-align:center;">
          <img alt="${t.name}" class="logo" src="https://yulia.photography/email/logo.png" />
        </td>
      </tr>

      <tr><td><div class="top_divider" aria-hidden="true"></div></td></tr>

      <!-- Thank you heading (RTL) -->
      <tr>
        <td class="pad-20" style="text-align:center; direction:${dir};">
          <div class="h-large">${t.thanks}</div>
        </td>
      </tr>

      <tr><td><div class="top_divider" aria-hidden="true"></div></td></tr>

      <!-- Top shadow / decorative image -->
      <tr>
        <td class="pad-10" style="text-align:center;">
          <img src="https://yulia.photography/email/up_shadow.png" alt="" style="width:100%; max-width:560px; border-radius:0;" />
        </td>
      </tr>

      <!-- Hero image -->
      <tr>
        <td class="pad-10" style="text-align:center;">
          <img class="hero_img" src="https://yulia.photography/email/hero_image.png" alt="" />
        </td>
      </tr>

      <!-- Bottom shadow / decorative image -->
      <tr>
        <td class="pad-10" style="text-align:center;">
          <img src="https://yulia.photography/email/down_shadow.png" alt="" style="width:100%; max-width:560px; border-radius:0;" />
        </td>
      </tr>

      <tr><td><div class="divider" aria-hidden="true"></div></td></tr>

      <tr><td class="pad-10"></td></tr>

      <!-- Contract text (RTL) -->
      <tr>
        <td class="pad-10" style="text-align:center; direction:${dir};">
          <div class="h-medium">${t.attached}</div>
        </td>
      </tr>

      <tr>
        <td class="pad-10" style="text-align:center;">
          <div class="h-medium" style="direction:${dir};">${t.help}</div>
        </td>
      </tr>

      <tr><td class="pad-10"></td></tr>

      <tr><td><div class="divider" aria-hidden="true"></div></td></tr>

      <tr><td class="pad-20"></td></tr>

      <!-- Buttons -->
      <tr>
        <td class="btn-wrap">
          <!-- Phone button -->
          <a href="tel:972525836940" class="btn" style="display:inline-block;">${t.phone}</a>
        </td>
      </tr>

      <tr>
        <td class="btn-wrap">
          <!-- WhatsApp button -->
          <a href="https://wa.me/972525836940" class="btn" style="display:inline-block;">WhatsApp</a>
        </td>
      </tr>

      <tr><td class="pad-20"></td></tr>

      <tr>
        <td class="footer">
          <span style="color:#f6f5f1; font-family:${locale === 'ru' ? 'Rubik, ' : ''}Arial, Helvetica, sans-serif; font-size:24px; font-weight:700; direction:${dir}; display:inline-block;">
            ${t.signoff}
          </span>
        </td>
      </tr>

    </table>
  </td></tr>
</table>

</body>
</html>
      `,
  };
}
