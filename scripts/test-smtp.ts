import * as fs from "fs";
import * as path from "path";
import * as tls from "node:tls";

// Load .env.local
const candidates = [".env.local", ".env"];
for (const file of candidates) {
  if (fs.existsSync(file)) {
    for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      if (process.env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

const host = process.env.SMTP_HOST || "smtp.zoho.in";
const port = parseInt(process.env.SMTP_PORT || "465", 10);
const user = process.env.SMTP_USER || "";
const pass = process.env.SMTP_APP_PASSWORD || "";

console.log(`Connecting to ${host}:${port} as ${user}...`);

const socket = tls.connect(
  {
    host,
    port,
    rejectUnauthorized: false,
    timeout: 10000,
  },
  () => {
    console.log("TLS Connected successfully.");
    let step = 0;
    let buffer = "";
    socket.setEncoding("utf-8");

    const send = (cmd: string) => {
      console.log("Client >", cmd.startsWith("AUTH") ? "AUTH LOGIN" : cmd.length > 20 ? cmd.slice(0, 8) + "..." : cmd);
      socket.write(cmd + "\r\n");
    };

    socket.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\r\n");
      const lastLine = lines.filter((l) => /^\d{3}\s/.test(l)).pop();
      if (!lastLine) return;
      console.log("Server >", lastLine);
      const code = parseInt(lastLine.slice(0, 3), 10);
      buffer = "";

      if (step === 0 && code === 220) {
        step = 1;
        send("EHLO sutrastudio.com");
      } else if (step === 1 && code === 250) {
        step = 2;
        send("AUTH LOGIN");
      } else if (step === 2 && code === 334) {
        step = 3;
        send(Buffer.from(user).toString("base64"));
      } else if (step === 3 && code === 334) {
        step = 4;
        send(Buffer.from(pass).toString("base64"));
      } else if (step === 4 && (code === 235 || code === 250)) {
        console.log("\n🎉 SMTP Authentication SUCCESSFUL!");
        step = 5;
        send("QUIT");
      } else if (code === 221) {
        console.log("Session finished cleanly.");
        process.exit(0);
      } else if (code >= 400) {
        console.error("\n❌ SMTP Server returned error:", code, lastLine);
        process.exit(1);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
      process.exit(1);
    });

    socket.on("timeout", () => {
      console.error("Socket timeout!");
      socket.destroy();
      process.exit(1);
    });
  }
);
