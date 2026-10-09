import { Resend } from "resend";
import { escapeHtml, waLink } from "@/lib/utils";
import type { Settings } from "@/lib/types";

type Mail = { to: string; subject: string; html: string; text: string };

function shell(settings: Settings, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#EAF8FA;font-family:Arial,sans-serif;color:#17343C">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#066676;border-radius:16px;padding:20px 24px">
      <div style="color:#ffffff;font-size:22px;font-weight:700">${escapeHtml(settings.shortName)}</div>
      <div style="color:#ffffff;font-size:13px;letter-spacing:1px">CLEANING SERVICES</div>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-top:16px;line-height:1.5">${body}</div>
  </div></body></html>`;
}

function row(label: string, value: string) {
  if (!value.trim()) return "";
  return `<p style="margin:0 0 8px"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

export function ownerLeadEmail(settings: Settings, input: {
  kind: string;
  reference: string;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  summary: string;
  message: string;
  extra: string;
}) {
  const phoneLink = input.phone ? `tel:+${input.phone.replace(/\D/g, "").replace(/^0/, "61")}` : "";
  const whatsapp = input.phone ? waLink(input.phone, `Hi ${input.name}, it's Spotless NT about ${input.reference}.`) : "";
  const links = [
    phoneLink ? `<a href="${phoneLink}">Call ${escapeHtml(input.name)}</a>` : "",
    whatsapp ? `<a href="${whatsapp}">WhatsApp</a>` : "",
  ].filter(Boolean).join(" · ");
  const html = shell(settings, `
    <h1 style="font-size:22px;margin:0 0 12px">New ${escapeHtml(input.kind)}</h1>
    ${row("Reference", input.reference)}
    ${row("Name", input.name)}
    ${row("Phone", input.phone)}
    ${row("Email", input.email)}
    ${row("Suburb", input.suburb)}
    ${row("Details", input.summary)}
    ${row("Message", input.message)}
    ${row("More", input.extra)}
    <p style="margin-top:16px">${links}</p>
  `);
  const text = [`New ${input.kind}`, `Reference: ${input.reference}`, `Name: ${input.name}`, `Phone: ${input.phone}`, `Email: ${input.email}`, `Suburb: ${input.suburb}`, input.summary, input.message, input.extra, phoneLink, whatsapp].filter(Boolean).join("\n");
  return { subject: `${input.kind} ${input.reference} — ${input.name || "Spotless NT"}`, html, text };
}

export function customerEmail(settings: Settings, input: { name: string; reference: string; kind: string }) {
  const html = shell(settings, `
    <h1 style="font-size:22px;margin:0 0 12px">Thanks ${escapeHtml(input.name)}</h1>
    <p>We have your ${escapeHtml(input.kind)}. Your reference is <strong>${escapeHtml(input.reference)}</strong>.</p>
    <p>We'll call to confirm the details and a fixed price. This request is saved, and the time is confirmed only once we speak with you.</p>
    <p>If you need us sooner, call ${escapeHtml(settings.phoneDisplay)} or reply to this email.</p>
  `);
  const text = `Thanks ${input.name}. Your ${input.kind} reference is ${input.reference}. We'll call to confirm the details and a fixed price. Call ${settings.phoneDisplay} if you need us sooner.`;
  return { subject: `We received ${input.reference} — ${settings.shortName}`, html, text };
}

export async function sendMail(messages: Mail[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !messages.length) return false;
  try {
    const resend = new Resend(key);
    const from = process.env.EMAIL_FROM || "Spotless NT <onboarding@resend.dev>";
    await Promise.all(messages.map((message) => resend.emails.send({ from, to: message.to, subject: message.subject, html: message.html, text: message.text })));
    return true;
  } catch (error) {
    console.error("Email failed", error);
    return false;
  }
}
