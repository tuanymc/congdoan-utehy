import { once } from "events";
import { connect as connectTcp } from "net";
import { connect as connectTls, type TLSSocket } from "tls";
import type { Socket } from "net";

export interface SmtpSendOptions {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}

/**
 * Gửi 1 email qua SMTP (STARTTLS cổng 587 hoặc SMTPS 465) — không phụ thuộc nodemailer, để
 * `nest build` trên server không cần cài thêm package. Khớp cách web cũ dùng SmtpClient Gmail
 * (xem web_cu/MyWeb/CV2/QLEmail.aspx.cs).
 */
export async function sendSmtpMail(options: SmtpSendOptions): Promise<void> {
  const socket = options.secure
    ? connectTls({ host: options.host, port: options.port, servername: options.host })
    : connectTcp({ host: options.host, port: options.port });

  try {
    const bannerPromise = readResponse(socket);
    await waitConnect(socket, options.secure);
    const banner = await bannerPromise;
    expectCode(banner.code, [220], banner.text);

    let session: Socket | TLSSocket = socket;
    await expectOk(session, `EHLO ${ehloName()}`);

    if (!options.secure) {
      const startTls = await command(session, "STARTTLS");
      expectCode(startTls.code, [220], startTls.text);
      session = connectTls({ socket: session, servername: options.host });
      await once(session, "secureConnect");
      await expectOk(session, `EHLO ${ehloName()}`);
    }

    await expectOk(session, "AUTH LOGIN");
    await expectOk(session, Buffer.from(options.user, "utf8").toString("base64"));
    const auth = await command(session, Buffer.from(options.password, "utf8").toString("base64"));
    expectCode(auth.code, [235], auth.text);

    const fromAddr = extractAddress(options.from);
    await expectOk(session, `MAIL FROM:<${fromAddr}>`);
    await expectOk(session, `RCPT TO:<${options.to}>`);
    await expectOk(session, "DATA", [354]);
    const data = await command(session, buildMime(options) + "\r\n.");
    expectCode(data.code, [250], data.text);
    await command(session, "QUIT").catch(() => undefined);
  } finally {
    socket.destroy();
  }
}

function ehloName(): string {
  return "congdoan.utehy.edu.vn";
}

function extractAddress(from: string): string {
  const match = /<([^>]+)>/.exec(from);
  return (match?.[1] ?? from).trim();
}

function encodeHeader(value: string): string {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function buildMime(options: SmtpSendOptions): string {
  const body = Buffer.from(options.text.replace(/\r?\n/g, "\r\n"), "utf8").toString("base64");
  const wrapped = body.replace(/(.{1,76})/g, "$1\r\n").trimEnd();
  return [
    `From: ${formatFrom(options.from)}`,
    `To: ${options.to}`,
    `Subject: ${encodeHeader(options.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapped
  ].join("\r\n");
}

function formatFrom(from: string): string {
  const match = /^(.*)<([^>]+)>\s*$/.exec(from);
  if (!match) return from;
  const name = match[1].trim().replace(/^"|"$/g, "");
  const email = match[2];
  if (!name) return email;
  return `${encodeHeader(name)} <${email}>`;
}

async function waitConnect(socket: Socket | TLSSocket, useTls: boolean): Promise<void> {
  await once(socket, useTls ? "secureConnect" : "connect");
}

async function expectOk(socket: Socket | TLSSocket, line: string, ok = [250, 334]): Promise<void> {
  const response = await command(socket, line);
  expectCode(response.code, ok, response.text);
}

function expectCode(code: number, allowed: number[], text: string): void {
  if (!allowed.includes(code)) {
    throw new Error(`SMTP ${code}: ${text.trim().slice(0, 300)}`);
  }
}

async function command(socket: Socket | TLSSocket, line: string): Promise<{ code: number; text: string }> {
  socket.write(`${line}\r\n`);
  return readResponse(socket);
}

function readResponse(socket: Socket | TLSSocket): Promise<{ code: number; text: string }> {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP timeout"));
    }, 20_000);

    const onData = (chunk: Buffer) => {
      buf += chunk.toString("utf8");
      const lines = buf.split(/\r?\n/).filter((line) => line.length > 0);
      const last = lines[lines.length - 1];
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve({ code: Number(last.slice(0, 3)), text: buf });
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
    };

    socket.on("data", onData);
    socket.on("error", onError);
  });
}
