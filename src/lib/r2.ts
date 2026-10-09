import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env, r2Configured } from "./env";
import { UPLOAD_RULES, type SignedUpload, type UploadKind } from "./upload-rules";

// Browser → Cloudflare R2 uploads through presigned PUT URLs (AWS Signature V4, S3-compatible API).
// The server only signs: file bytes never pass through Next.js. Without R2 configured (local development)
// uploads go to /api/uploads/local and land in public/uploads.

const CACHE_CONTROL = "public, max-age=31536000, immutable";
const EXPIRES_S = 600;

const sha256 = (data: string) => createHash("sha256").update(data).digest("hex");
const hmac = (key: Buffer | string, data: string) => createHmac("sha256", key).update(data).digest();

/** RFC 3986 encoding as SigV4 expects: only A-Z a-z 0-9 - _ . ~ stay literal. */
const encode = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const encodePath = (p: string) => p.split("/").map(encode).join("/");

/**
 * Presigns a request with SigV4 query parameters. Every header passed in is signed, so the client must send
 * those exact values (the browser sets Content-Length itself from the body, which is how the size is enforced).
 */
export function presign(opts: {
  method: string;
  url: URL;
  headers: Record<string, string>;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  expiresS: number;
  now?: Date;
}): string {
  const amzDate = (opts.now ?? new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${opts.region}/${opts.service}/aws4_request`;

  const headers = Object.entries({ ...opts.headers, host: opts.url.host })
    .map(([k, v]) => [k.toLowerCase(), String(v).trim()] as const)
    .sort(([a], [b]) => (a < b ? -1 : 1));
  const signedHeaders = headers.map(([k]) => k).join(";");

  const query: [string, string][] = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${opts.accessKeyId}/${scope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(opts.expiresS)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ];
  const canonicalQuery = query
    .map(([k, v]) => [encode(k), encode(v)])
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const canonicalRequest = [
    opts.method,
    encodePath(opts.url.pathname),
    canonicalQuery,
    headers.map(([k, v]) => `${k}:${v}\n`).join(""),
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");

  const kDate = hmac(`AWS4${opts.secretAccessKey}`, day);
  const kSigning = hmac(hmac(hmac(kDate, opts.region), opts.service), "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  return `${opts.url.origin}${encodePath(opts.url.pathname)}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/** Object key like `cards/images/2026-10/3f9c…e1.webp`. Random and never reused, so it can be cached forever. */
export function newObjectKey(kind: UploadKind, ext: string) {
  return `cards/${kind}s/${new Date().toISOString().slice(0, 7)}/${randomBytes(12).toString("hex")}.${ext}`;
}

export function signUpload(kind: UploadKind, contentType: string, size: number): SignedUpload {
  const ext = UPLOAD_RULES[kind].types[contentType];
  const key = newObjectKey(kind, ext);
  const headers = { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL };

  if (r2Configured()) {
    const url = new URL(`https://${env.r2AccountId}.r2.cloudflarestorage.com/${env.r2Bucket}/${key}`);
    const uploadUrl = presign({
      method: "PUT",
      url,
      headers: { ...headers, "Content-Length": String(size) },
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
      region: "auto",
      service: "s3",
      expiresS: EXPIRES_S,
    });
    return { uploadUrl, headers, publicUrl: `${env.r2PublicUrl}/${key}`, key };
  }

  // Local development: a short-lived HMAC ticket for /api/uploads/local.
  const exp = Math.floor(Date.now() / 1000) + EXPIRES_S;
  const sig = localTicket(key, contentType, size, exp);
  return {
    uploadUrl: `/api/uploads/local?key=${encodeURIComponent(key)}&exp=${exp}&size=${size}&sig=${sig}`,
    headers,
    publicUrl: `/uploads/${key}`,
    key,
  };
}

const localSecret = () => env.sessionSecret || "local-dev-upload-secret";
const localTicket = (key: string, type: string, size: number, exp: number) =>
  createHmac("sha256", localSecret()).update(`${key}\n${type}\n${size}\n${exp}`).digest("hex");

export function verifyLocalTicket(key: string, type: string, size: number, exp: number, sig: string) {
  if (!/^cards\/(image|video)s\/\d{4}-\d{2}\/[0-9a-f]{24}\.[a-z0-9]{2,4}$/.test(key)) return false;
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const expected = Buffer.from(localTicket(key, type, size, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
