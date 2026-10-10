import { contractPresentation } from '../../lib/contract-presentation';
import { contractEmail } from '../../lib/contract-email';
import { packageDurationLabel } from '../../lib/session-duration';
export const prerender = false;

import { getContractInvitation, invitationError } from '../../lib/contract-invitation';
import { verifyContractToken } from '../../lib/contract-token';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';
import { Resend } from 'resend';
import type { APIContext } from 'astro';
import { sql } from '../../lib/db.ts';

export async function GET() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/thank_you',
    },
  });
}

export async function POST(context: APIContext) {
  let deliveryStarted = false;
  try {
    // 1) ensure API key is present (fail gracefully)
    const apiKey = import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set!');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not set on the server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // instantiate Resend here (after confirming key)
    const resend = new Resend(apiKey);

    // 2) parse form fields
    const form = await context.request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const invitation = await verifyContractToken(String(form.get('token') ?? ''));
    if (!invitation)
      return new Response(JSON.stringify({ error: 'Invalid or expired contract link' }), { status: 403 });
    const presentation = contractPresentation(invitation.locale, invitation.conf);
    const mail = contractEmail(invitation.locale);
    const phone = invitation.phone;
    const id = String(form.get('id') ?? '').trim();
    const address = String(form.get('address') ?? '').trim();
    const signature = String(form.get('signature') ?? '').trim();
    const mySignatureBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAASwAAAB4CAYAAABIFc8gAAAACXBIWXMAAB2HAAAdhwGP5fFlAAAEvWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTEwLTA1PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmQxYjRjMjdiLWYxYTgtNDQ2OC05ZjZkLTNhNGIzOGFmY2EzOTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5VbnRpdGxlZCBkZXNpZ24gLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlv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';

    if (!name || !email || !phone || !id || !address || !signature) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const booking = await getContractInvitation(invitation);
    const unavailable = invitationError(booking);
    if (unavailable) return unavailable;

    // 3) load template PDF and font via URL fetching
    const baseUrl = `${context.url.protocol}//${context.url.host}`;
    const templatePath = presentation.template;
    const [templateBytes, fontBytes] = await Promise.all(
      [templatePath, presentation.font].map(async (path) => {
        const response = await fetch(`${baseUrl}${path}`);
        if (!response.ok) throw new Error(`Failed to fetch contract asset: ${response.status}`);
        return new Uint8Array(await response.arrayBuffer());
      })
    );

    const sessionId = booking.id;
    const price = booking.session_price?.toString() ?? 'לא נמצא';
    const contractType = packageDurationLabel(booking.package_type, invitation.locale);

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.setLanguage(invitation.locale);
    pdfDoc.setSubject(
      `Photography contract ${invitation.locale} v${invitation.contractVersion}; publication=${invitation.conf}`
    );
    const pdfForm = pdfDoc.getForm();
    pdfDoc.registerFontkit(fontkit);

    const page2 = pdfDoc.getPages()[1];

    // Load the font selected by the signed invitation language
    const contractFont = await pdfDoc.embedFont(fontBytes);

    // Update text fields with the selected font
    const fieldNames = [
      'client_name',
      'client_id',
      'client_address',
      'client_phone',
      'date_1',
      'type',
      'price',
      'date_2',
    ];

    // Fix Hebrew + number order issue (reverse digits only when mixed with Hebrew)
    function fixHebrewText(str: string): string {
      // If string contains Hebrew and numbers, reverse digits inside
      if (/[\u0590-\u05FF]/.test(str) && /\d/.test(str)) {
        return str.replace(/\d+/g, (num) => num.split('').reverse().join(''));
      }
      return str; // otherwise leave as-is
    }

    for (const fieldName of fieldNames) {
      const field = pdfForm.getTextField(fieldName);

      // Determine text to insert for this field
      const textValue = (() => {
        switch (fieldName) {
          case 'client_name':
            return name;
          case 'client_id':
            return id;
          case 'client_address':
            return address;
          case 'client_phone':
            return phone;
          case 'date_1':
            return new Date().toLocaleDateString(presentation.dateLocale, { timeZone: 'Asia/Jerusalem' });
          case 'price':
            return price;
          case 'type':
            return contractType;
          case 'date_2':
            return new Date().toLocaleDateString(presentation.dateLocale, { timeZone: 'Asia/Jerusalem' });
          default:
            return '';
        }
      })();

      // Preserve the legacy Hebrew number handling only for Hebrew contracts
      field.setText(invitation.locale === 'he' ? fixHebrewText(textValue) : textValue);
      field.updateAppearances(contractFont);
    }

    // 5) handle signature: strip data URL and convert to bytes
    let sigBytes: Uint8Array;
    if (signature.startsWith('data:')) {
      const base64 = signature.split(',')[1];
      sigBytes = Buffer.from(base64, 'base64');
    } else {
      sigBytes = Buffer.from(signature, 'base64');
    }

    const mySigBytes = Buffer.from(mySignatureBase64, 'base64');
    const myPngImage = await pdfDoc.embedPng(mySigBytes);
    page2.drawImage(myPngImage, { x: 350, y: 55, width: 150, height: 60 });

    const pngImage = await pdfDoc.embedPng(sigBytes);
    page2.drawImage(pngImage, { x: 50, y: 55, width: 150, height: 60 });

    pdfForm.flatten();
    const pdfBytes = await pdfDoc.save();

    // The database arbitrates concurrent submissions. Only the winner can send email.
    const claimed = await sql`UPDATE contract_invitations
      SET status = 'processing', processing_started_at = NOW()
      WHERE id = ${invitation.invitationId} AND session_id = ${invitation.sessionId}
        AND status = 'pending' AND expires_at > NOW()
        AND EXISTS (SELECT 1 FROM sessions WHERE id = ${invitation.sessionId} AND COALESCE(workflow->>'status', '') <> 'cancelled')
      RETURNING id`;
    if (!claimed.length) {
      return (
        invitationError(await getContractInvitation(invitation)) ||
        new Response(JSON.stringify({ code: 'processing' }), { status: 409 })
      );
    }

    deliveryStarted = true;
    // 6) send email with attachment (base64)
    const emailResult = await resend.emails.send({
      from: `${mail.name} <send@yulia.photography>`, // must be verified in Resend
      to: [email, 'sjmikee@gmail.com', 'mizenkoyulia@gmail.com'],
      subject: mail.subject,
      text: mail.text,

      html: mail.html,

      attachments: [
        {
          filename: mail.filename,
          content: Buffer.from(pdfBytes).toString('base64'),
        },
      ],
    });

    if (emailResult.error) {
      console.error('Contract email error:', emailResult.error);
      return new Response(
        JSON.stringify({
          code: 'processing',
          error: 'Contract delivery needs review. Please contact the photographer.',
        }),
        {
          status: 502,
        }
      );
    }

    // Commit client details and signature status together, only after PDF creation and email acceptance.
    await sql.transaction([
      sql`UPDATE clients SET name = ${name}, email = ${email}, tz = ${id}
          WHERE id = (SELECT client_id FROM sessions WHERE id = ${sessionId})`,
      sql`UPDATE sessions SET contract_signed = TRUE, workflow = COALESCE(workflow, '{}'::jsonb) || ${JSON.stringify({ contract_language: invitation.locale, contract_version: invitation.contractVersion })}::jsonb WHERE id = ${sessionId}`,
      sql`UPDATE contract_invitations SET status = 'signed', signed_at = NOW()
          WHERE id = ${invitation.invitationId} AND status = 'processing'`,
    ]);
    return context.redirect(presentation.thankYouPath, 303);
  } catch (err) {
    console.error('submit_contract error:', err);
    return new Response(
      JSON.stringify({
        code: deliveryStarted ? 'processing' : 'retry',
        error: 'Unable to complete contract submission',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
