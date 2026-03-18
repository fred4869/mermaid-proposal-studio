const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = process.env.PORT || 4173;
const host = "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

http
  .createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : req.url;
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(error.code === "ENOENT" ? 404 : 500, {
          "Content-Type": "text/plain; charset=utf-8"
        });
        res.end(error.code === "ENOENT" ? "Not Found" : "Server Error");
        return;
      }

      res.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
      });
      res.end(content);
    });
  })
  .listen(port, host, () => {
    console.log(`Mermaid Proposal Studio running at http://${host}:${port}`);
  });
