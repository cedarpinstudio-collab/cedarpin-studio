const crypto = require("crypto");

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

const ISRAEL_TERMS = /(?:\bisrael\b|\bisraeli\b|إسرائيل|اسرائيل|فلسطين المحتلة)/iu;

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function signatureIsValid(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const supplied = String(signature);
  if (supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function inboundMessages(payload) {
  const messages = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) messages.push(message);
    }
  }
  return messages;
}

function prohibited(message) {
  const sender = String(message.from || "").replace(/\D/g, "");
  if (sender.startsWith("972")) return true;
  const text = message.text?.body || "";
  return ISRAEL_TERMS.test(text);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const configuredToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && configuredToken && token === configuredToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ ok: false });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false });
  }

  try {
    const rawBody = await readRawBody(req);
    const secret = process.env.WHATSAPP_APP_SECRET;
    const signature = req.headers["x-hub-signature-256"];

    if (!signatureIsValid(rawBody, signature, secret)) {
      return res.status(401).json({ ok: false });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const messages = inboundMessages(payload);
    const accepted = messages.filter((message) => !prohibited(message));

    // Privacy: never log message bodies or complete phone numbers.
    console.log(JSON.stringify({
      event: "whatsapp_webhook",
      received: messages.length,
      accepted: accepted.length,
      blocked: messages.length - accepted.length,
      at: new Date().toISOString(),
    }));

    // Phase 1 receives and validates events only. Automated replies remain disabled
    // until templates, consent rules, escalation, and lead storage are verified.
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(JSON.stringify({ event: "whatsapp_webhook_error", at: new Date().toISOString() }));
    return res.status(400).json({ ok: false });
  }
};
