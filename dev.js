/**
 * Toppko Aesthetics - Local Development & Requisition API Server
 * Ultra-fast static HTTP server + Resend.com Email & Google reCAPTCHA API endpoints.
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;

// Lightweight .env file loader (zero external dependencies)
function loadEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain"
};

/**
 * Verify reCAPTCHA token against Google's siteverify API
 */
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
          const parsed = JSON.parse(data);
          resolve(parsed);
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

/**
 * Send Transactional Email via Resend.com REST API
 */
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

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end();
    return;
  }

  let reqPath = decodeURI(req.url.split("?")[0]);

  // ==========================================
  // API ENDPOINT: POST /api/requisition
  // ==========================================
  if (req.method === "POST" && (reqPath === "/api/requisition" || reqPath === "/api/contact")) {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const { name, phone, product, notes, email, recaptchaToken } = payload;

        if (!name || !phone) {
          res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({ success: false, error: "Doctor/Clinic Name and WhatsApp Contact Phone are required." }));
          return;
        }

        // 1. Google reCAPTCHA Verification (if secret key configured)
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        if (recaptchaSecret && recaptchaToken) {
          const recaptchaResult = await verifyRecaptcha(recaptchaSecret, recaptchaToken);
          if (!recaptchaResult.success || (recaptchaResult.score !== undefined && recaptchaResult.score < 0.4)) {
            console.warn("[reCAPTCHA Warning] Verification failed or score too low:", recaptchaResult);
            res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
            res.end(JSON.stringify({ success: false, error: "reCAPTCHA verification failed. Please try again or use direct WhatsApp." }));
            return;
          }
        }

        // 2. Email Delivery via Resend.com
        const resendApiKey = process.env.RESEND_API_KEY;
        const toEmail = process.env.TO_EMAIL || "toppkoaesthetic@gmail.com";
        const fromEmail = process.env.FROM_EMAIL || "Toppko Aesthetics <onboarding@resend.dev>";

        let emailSent = false;
        let emailId = null;
        let emailError = null;

        if (resendApiKey) {
          try {
            const emailData = {
              from: fromEmail,
              to: [toEmail],
              subject: `🏥 New Clinic Requisition: ${name} (${phone})`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; background: #FAF7F2; border: 1px solid #E3D9CD; border-radius: 16px; color: #2C241D;">
                  <div style="border-bottom: 2px solid #D4E84A; padding-bottom: 16px; margin-bottom: 24px;">
                    <h1 style="font-size: 20px; font-weight: 800; color: #1B1813; margin: 0; letter-spacing: -0.02em;">TOPPKO AESTHETICS</h1>
                    <p style="font-size: 13px; color: #7A6C60; margin: 4px 0 0 0;">Official Clinic & Practitioner Requisition Notification</p>
                  </div>

                  <h2 style="font-size: 16px; font-weight: 700; color: #1B1813; margin: 0 0 16px 0;">New Requisition Summary</h2>

                  <table style="width: 100%; border-collapse: separate; border-spacing: 0; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E8E2D9; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #F0ECE4;">
                      <td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; width: 140px; background: #FAF8F5;">Doctor / Clinic:</td>
                      <td style="padding: 12px 16px; font-weight: 600; color: #1B1813;">${escapeHtml(name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F0ECE4;">
                      <td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">WhatsApp / Phone:</td>
                      <td style="padding: 12px 16px; font-weight: 600; color: #1B1813;"><a href="tel:${escapeHtml(phone)}" style="color: #1B1813; text-decoration: none;">${escapeHtml(phone)}</a></td>
                    </tr>
                    ${email ? `<tr style="border-bottom: 1px solid #F0ECE4;">
                      <td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">Email Address:</td>
                      <td style="padding: 12px 16px; color: #1B1813;"><a href="mailto:${escapeHtml(email)}" style="color: #6E5A4E;">${escapeHtml(email)}</a></td>
                    </tr>` : ""}
                    <tr style="border-bottom: 1px solid #F0ECE4;">
                      <td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">Items Requested:</td>
                      <td style="padding: 12px 16px; font-weight: 700; color: #1B1813; background: #FFFDF7;">${escapeHtml(product || "General Catalog Inquiry")}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 16px; font-weight: 700; color: #6E5A4E; background: #FAF8F5;">Clinical Notes:</td>
                      <td style="padding: 12px 16px; color: #4A3E36; line-height: 1.5;">${notes ? escapeHtml(notes).replace(/\n/g, "<br>") : "None specified."}</td>
                    </tr>
                  </table>

                  <div style="margin-top: 24px; padding: 18px 20px; background: #1B1813; border-radius: 12px; text-align: center;">
                    <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" 
                       style="display: inline-block; background: #D4E84A; color: #17140B; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: 800; text-decoration: none;">
                      💬 Reply to Practitioner on WhatsApp (${escapeHtml(phone)})
                    </a>
                  </div>

                  <p style="font-size: 11px; color: #9A8C7F; margin-top: 24px; text-align: center;">
                    Toppko Aesthetics Distribution Network &bull; Priority Practitioner Desk
                  </p>
                </div>
              `
            };

            const result = await sendResendEmail(resendApiKey, emailData);
            emailSent = true;
            emailId = result.id;
            console.log(`[RESEND SUCCESS] Dispatched requisition email to ${toEmail} (ID: ${emailId})`);
          } catch (rErr) {
            console.error("[RESEND ERROR]", rErr.message);
            emailError = rErr.message;
          }
        } else {
          console.log("[REQUISITION LOGGED (SIMULATED)]: Set RESEND_API_KEY in .env for live email delivery.");
          console.log(`- Doctor/Clinic: ${name}`);
          console.log(`- Phone: ${phone}`);
          console.log(`- Products: ${product || "N/A"}`);
          console.log(`- Notes: ${notes || "None"}`);
        }

        // WhatsApp direct link generator
        const waText = `*CLINIC REQUISITION — TOPPKO AESTHETICS*\n` +
          `• Doctor/Clinic: ${name}\n` +
          `• Contact Phone: ${phone}\n` +
          `• Products Required: ${product || "General Catalog Inquiry"}\n` +
          (notes ? `• Notes: ${notes}\n` : "");
        const waUrl = `https://wa.me/923277319079?text=${encodeURIComponent(waText)}`;

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({
          success: true,
          emailDelivered: emailSent,
          simulated: !resendApiKey,
          emailId,
          waUrl,
          message: emailSent
            ? "Requisition logged and dispatched via email to Toppko Aesthetics."
            : "Requisition logged successfully! (Set RESEND_API_KEY in .env for live email delivery)."
        }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ==========================================
  // STATIC ASSETS FILE SERVER
  // ==========================================
  if (reqPath === "/") reqPath = "/index.html";

  let filePath = path.join(ROOT_DIR, reqPath);

  if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
    filePath = filePath + ".html";
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    const pubPath = path.join(ROOT_DIR, "public", reqPath);
    if (fs.existsSync(pubPath) && !fs.statSync(pubPath).isDirectory()) {
      filePath = pubPath;
    }
  }

  if (!fs.existsSync(filePath)) {
    const distPath = path.join(ROOT_DIR, "dist", reqPath);
    if (fs.existsSync(distPath)) {
      filePath = fs.statSync(distPath).isDirectory() ? path.join(distPath, "index.html") : distPath;
    }
  }

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!DOCTYPE html><html><body><h2>404 Not Found</h2><p>Requested: ${reqPath}</p></body></html>`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server Error: " + err.message);
  }
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Toppko Aesthetics Dev Server listening on http://localhost:${PORT}/ (no-cache enabled)`);
  console.log(`Requisition API ready at POST http://localhost:${PORT}/api/requisition`);
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Tip] Create a .env file with RESEND_API_KEY=re_... to send live emails to toppkoaesthetic@gmail.com`);
  }
});
