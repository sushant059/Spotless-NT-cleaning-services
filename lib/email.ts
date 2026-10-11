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

/** Gmail (an app password on the business Gmail) works without owning a domain, so it is preferred. */
export function gmailEnabled() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export function emailEnabled() {
  return gmailEnabled() || Boolean(process.env.RESEND_API_KEY);
}

/** Sends each message separately. Returns how many went, and the first error if any failed. */
export async function sendMailEach(messages: (Mail & { replyTo?: string })[]): Promise<{ sent: number; failed: string[]; error?: string }> {
  const failed: string[] = [];
  let error: string | undefined;
  if (gmailEnabled()) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    const from = process.env.EMAIL_FROM || `Spotless NT Cleaning <${process.env.GMAIL_USER}>`;
    for (const message of messages) {
      try {
        await transport.sendMail({ from, to: message.to, replyTo: message.replyTo, subject: message.subject, html: message.html, text: message.text });
      } catch (reason) {
        failed.push(message.to);
        error ??= reason instanceof Error ? reason.message : String(reason);
      }
    }
    return { sent: messages.length - failed.length, failed, error };
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, failed: messages.map((message) => message.to), error: "Email isn't set up yet." };
  const resend = new Resend(key);
  const from = process.env.EMAIL_FROM || "Spotless NT <onboarding@resend.dev>";
  for (const message of messages) {
    const result = await resend.emails.send({ from, to: message.to, replyTo: message.replyTo, subject: message.subject, html: message.html, text: message.text }).catch((reason) => ({ error: { message: String(reason) } }));
    if (result.error) {
      failed.push(message.to);
      error ??= result.error.message;
    }
  }
  return { sent: messages.length - failed.length, failed, error };
}

export async function sendMail(messages: Mail[]) {
  if (!messages.length || !emailEnabled()) return false;
  try {
    const result = await sendMailEach(messages);
    if (result.error) console.error("Email failed", result.error);
    return result.sent > 0;
  } catch (error) {
    console.error("Email failed", error);
    return false;
  }
}

/** An offer email: the message as paragraphs, with the business footer and an unsubscribe line. */
export function offerEmail(settings: Settings, input: { subject: string; message: string }) {
  const paragraphs = input.message.split(/\n{2,}|\n/).filter((line) => line.trim()).map((line) => `<p style="margin:0 0 12px">${escapeHtml(line).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`).join("");
  const footer = `<p style="margin-top:20px;font-size:13px;color:#4A5D75">${escapeHtml(settings.businessName)} · ${escapeHtml(settings.phoneDisplay)} · ${escapeHtml(settings.email)}<br>Don't want offers from us? Reply with “unsubscribe” and we'll take you off the list.</p>`;
  const text = `${input.message}\n\n${settings.businessName} · ${settings.phoneDisplay}\nReply "unsubscribe" to stop offers.`;
  return { subject: input.subject, html: shell(settings, paragraphs + footer), text };
}
