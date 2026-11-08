/**
 * Toppko Aesthetics - Local Development Server
 * Ultra-fast static HTTP server with zero caching for immediate live updates.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

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

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split("?")[0]);
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

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Toppko Aesthetics Dev Server listening on http://localhost:${PORT}/ (no-cache enabled)`);
});
