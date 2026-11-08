/**
 * Serverless Function: POST /api/requisition
 * Supports Vercel, Netlify, and standard Node.js serverless runtimes.
 */

const https = require("https");

function verifyRecaptcha(secretKey, token) {
  return new Promise((resolve) => {
    if (!secretKey || !token) {
      return resolve({ success: true, bypassed: true });
    }

    const postData = `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`;
    const req = https.request({
      hostname: "www.google.com",
      port: 443,
      path: "/recaptcha/api/siteverify",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on("error", (err) => resolve({ success: false, error: err.message }));
    req.write(postData);
    req.end();
  });
}

function sendResendEmail(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = https.request({
      hostname: "api.resend.com",
      port: 443,
      path: "/emails",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `Resend Error HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(`Resend invalid JSON: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { name, phone, product, notes, email, recaptchaToken } = payload;

    if (!name || !phone) {
      res.status(400).json({ success: false, error: "Doctor/Clinic Name and WhatsApp Contact Phone are required." });
      return;
    }

    // Google reCAPTCHA Verification
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret && recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaSecret, recaptchaToken);
      if (!recaptchaResult.success || (recaptchaResult.score !== undefined && recaptchaResult.score < 0.4)) {
        res.status(400).json({ success: false, error: "reCAPTCHA verification failed." });
        return;
      }
    }

    // Resend Email Delivery
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.TO_EMAIL || "toppkoaesthetic@gmail.com";
    const fromEmail = process.env.FROM_EMAIL || "Toppko Aesthetics <onboarding@resend.dev>";

    let emailSent = false;
    let emailId = null;

    if (resendApiKey) {
      try {
        const result = await sendResendEmail(resendApiKey, {
          from: fromEmail,
          to: [toEmail],
          subject: `🏥 New Clinic Requisition: ${name} (${phone})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; background: #FAF7F2; border: 1px solid #E3D9CD; border-radius: 16px; color: #2C241D;">
              <div style="border-bottom: 2px solid #D4E84A; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="font-size: 20px; font-weight: 800; color: #1B1813; margin: 0;">TOPPKO AESTHETICS</h1>
                <p style="font-size: 13px; color: #7A6C60; margin: 4px 0 0 0;">Official Clinic Requisition Notification</p>
              </div>
              <h2 style="font-size: 16px; font-weight: 700; color: #1B1813; margin: 0 0 16px 0;">New Requisition Summary</h2>
              <table style="width: 100%; border-collapse: separate; border-spacing: 0; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E8E2D9; font-size: 14px;">
                <tr><td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; width: 140px; background: #FAF8F5;">Doctor / Clinic:</td><td style="padding: 12px 16px; font-weight: 600; color: #1B1813;">${escapeHtml(name)}</td></tr>
                <tr><td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">WhatsApp / Phone:</td><td style="padding: 12px 16px; font-weight: 600; color: #1B1813;">${escapeHtml(phone)}</td></tr>
                ${email ? `<tr><td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">Email Address:</td><td style="padding: 12px 16px; color: #1B1813;">${escapeHtml(email)}</td></tr>` : ""}
                <tr><td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">Items Requested:</td><td style="padding: 12px 16px; font-weight: 700; color: #1B1813; background: #FFFDF7;">${escapeHtml(product || "General Catalog Inquiry")}</td></tr>
                <tr><td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">Clinical Notes:</td><td style="padding: 12px 16px; color: #4A3E36; line-height: 1.5;">${notes ? escapeHtml(notes).replace(/\n/g, "<br>") : "None specified."}</td></tr>
              </table>
              <div style="margin-top: 24px; padding: 18px 20px; background: #1B1813; border-radius: 12px; text-align: center;">
                <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="display: inline-block; background: #D4E84A; color: #17140B; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: 800; text-decoration: none;">
                  💬 Reply to Practitioner on WhatsApp (${escapeHtml(phone)})
                </a>
              </div>
            </div>
          `
        });
        emailSent = true;
        emailId = result.id;
      } catch (e) {
        console.error("Resend delivery failed:", e.message);
      }
    }

    const waText = `*CLINIC REQUISITION — TOPPKO AESTHETICS*\n` +
      `• Doctor/Clinic: ${name}\n` +
      `• Contact Phone: ${phone}\n` +
      `• Products Required: ${product || "General Catalog Inquiry"}\n` +
      (notes ? `• Notes: ${notes}\n` : "");
    const waUrl = `https://wa.me/923277319079?text=${encodeURIComponent(waText)}`;

    res.status(200).json({
      success: true,
      emailDelivered: emailSent,
      simulated: !resendApiKey,
      emailId,
      waUrl,
      message: emailSent
        ? "Requisition logged and dispatched via email to Toppko Aesthetics."
        : "Requisition logged successfully!"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
