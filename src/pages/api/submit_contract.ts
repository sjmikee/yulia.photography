export const prerender = false;

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { Resend } from "resend";
import type { APIContext } from "astro";

export async function GET() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/thank_you",
    },
  });
}

export async function POST(context: APIContext) {
  try {
    // 1) ensure API key is present (fail gracefully)
    const apiKey = import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set!");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not set on the server" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // instantiate Resend here (after confirming key)
    const resend = new Resend(apiKey);

    // 2) parse form fields
    const form = await context.request.formData();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const id = String(form.get("id") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const signature = String(form.get("signature") ?? "").trim();

    if (!name || !email || !phone || !id || !address || !signature) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // 3) load template PDF and font via URL fetching
    const baseUrl = `${context.url.protocol}//${context.url.host}`;

    const templateRes = await fetch(`${baseUrl}/template_contract.pdf`);
    if (!templateRes.ok) {
      throw new Error(`Failed to fetch PDF: ${templateRes.status} ${templateRes.statusText}`);
    }
    const templateBytes = new Uint8Array(await templateRes.arrayBuffer());

    const fontRes = await fetch(`${baseUrl}/fonts/NotoSansHebrew-Regular.ttf`);
    if (!fontRes.ok) {
      throw new Error(`Failed to fetch font: ${fontRes.status} ${fontRes.statusText}`);
    }
    const fontBytes = new Uint8Array(await fontRes.arrayBuffer());

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);

    const page1 = pdfDoc.getPages()[0];
    const page2 = pdfDoc.getPages()[1];

    // Load Hebrew-capable font
    const hebrewFont = await pdfDoc.embedFont(fontBytes);

    // 4) draw form data (adjust coordinates to fit your template)
    // For Hebrew fields, reverse the string to display RTL
    page1.drawText(`${name}`, { x: 423, y: 616, size: 12, color: rgb(0, 0, 0), font: hebrewFont });
    page1.drawText(`${id}`, { x: 292, y: 616, size: 12, font: hebrewFont });
    page1.drawText(`${address}`, { x: 120, y: 616, size: 12, font: hebrewFont });
    page1.drawText(`${phone}`, { x: 442, y: 598, size: 12, font: hebrewFont });
    
    

    // 5) handle signature: strip data URL and convert to bytes
    let sigBytes: Uint8Array;
    if (signature.startsWith("data:")) {
      const base64 = signature.split(",")[1];
      sigBytes = Buffer.from(base64, "base64");
    } else {
      sigBytes = Buffer.from(signature, "base64");
    }

    const pngImage = await pdfDoc.embedPng(sigBytes);
    page2.drawImage(pngImage, { x: 50, y: 55, width: 150, height: 60 });

    const pdfBytes = await pdfDoc.save();

    // 6) send email with attachment (base64)
    await resend.emails.send({
      from: "send@yulia.photography", // must be verified in Resend
      to: [email, "sjmikee@gmail.com"],
      subject: "חוזה צילום חתום",
      text: "מצורף החוזה החתום, לכל שאלה אני תמיד זמינה 😊",
      attachments: [
        {
          filename: "חוזה-צילום-יוליה.pdf",
          content: Buffer.from(pdfBytes).toString("base64"),
        },
      ],
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("submit_contract error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}