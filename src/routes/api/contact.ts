import { createFileRoute } from "@tanstack/react-router";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  topic?: string;
};

const DEFAULT_CONTACT_EMAIL = "haileyliz1130@gmail.com";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json().catch(() => ({}))) as ContactPayload;
        const contact = normalizeContactPayload(payload);

        if (!contact.ok) {
          return json({ ok: false, error: contact.error }, 400);
        }

        const recipient = getEnv("CONTACT_EMAIL") || DEFAULT_CONTACT_EMAIL;
        const resendApiKey = getEnv("RESEND_API_KEY");

        if (!resendApiKey) {
          return json({
            ok: true,
            configured: false,
            mailto: buildMailtoUrl(recipient, contact.value),
          });
        }

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: getEnv("CONTACT_FROM_EMAIL") || "Hailey's Website <onboarding@resend.dev>",
              to: [recipient],
              reply_to: contact.value.email,
              subject: `[Website] ${contact.value.subject}`,
              text: [
                `Name: ${contact.value.name}`,
                `Email: ${contact.value.email}`,
                `Topic: ${contact.value.topic}`,
                "",
                contact.value.message,
              ].join("\n"),
            }),
          });

          if (!response.ok) {
            throw new Error(`Resend returned ${response.status}`);
          }

          return json({ ok: true, configured: true });
        } catch (error) {
          console.error(error);
          return json(
            {
              ok: false,
              error: "Message sending is unavailable right now.",
              mailto: buildMailtoUrl(recipient, contact.value),
            },
            502,
          );
        }
      },
    },
  },
});

function normalizeContactPayload(payload: ContactPayload) {
  const value = {
    name: cleanText(payload.name, 80),
    email: cleanText(payload.email, 120),
    subject: cleanText(payload.subject, 120) || "A note from the website",
    topic: cleanText(payload.topic, 40) || "general note",
    message: cleanText(payload.message, 3000),
  };

  if (!value.name) return { ok: false as const, error: "Please include your name." };
  if (!isEmail(value.email)) return { ok: false as const, error: "Please include a valid email." };
  if (value.message.length < 10) {
    return { ok: false as const, error: "Please write a little more in your message." };
  }

  return { ok: true as const, value };
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildMailtoUrl(
  recipient: string,
  contact: { name: string; email: string; subject: string; topic: string; message: string },
) {
  const body = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Topic: ${contact.topic}`,
    "",
    contact.message,
  ].join("\n");

  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
    contact.subject,
  )}&body=${encodeURIComponent(body)}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function getEnv(name: string) {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}
