import { Resend } from "resend";
import { escapeHtml, siteUrl, waLink } from "@/lib/utils";
import type { Settings } from "@/lib/types";

type Mail = { to: string; subject: string; html: string; text: string };

function shell(settings: Settings, body: string) {
  const logo = `${siteUrl()}/brand/signature-icon.png`;
  return `<!doctype html><html><body style="margin:0;background:#F2F6FB;font-family:Arial,Helvetica,sans-serif;color:#13202F">
  <div style="max-width:580px;margin:0 auto;padding:24px">
    <div style="background:#0F2D4F;border-radius:16px;padding:16px 20px">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:12px"><img src="${logo}" width="48" height="48" alt="" style="display:block;border-radius:10px;border:0"></td>
        <td><div style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:.5px">${escapeHtml(settings.businessName.replace(/ Cleaning Services$/i, "").toUpperCase())}</div>
        <div style="color:#5ED184;font-size:11px;letter-spacing:3px;font-weight:700">CLEANING SERVICES</div></td>
      </tr></table>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-top:14px;line-height:1.55;border:1px solid #E5EAF0">${body}</div>
    <p style="text-align:center;font-size:12px;color:#566476;margin:14px 0 0">${escapeHtml(settings.businessName)} · ${escapeHtml(settings.phoneDisplay)} · ${escapeHtml(settings.email)}</p>
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
  const whatsapp = input.phone ? waLink(input.phone, `Hi ${input.name}, it's Territory Spotless about ${input.reference}.`) : "";
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
  return { subject: `${input.kind} ${input.reference} — ${input.name || "Territory Spotless"}`, html, text };
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

/**
 * The business mailbox over SMTP (Microsoft 365: smtp.office365.com, port 587), so mail goes out
 * from info@ and lands in its Sent folder. Gmail and Resend remain as fallbacks.
 */
export function smtpEnabled() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export function gmailEnabled() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export function emailEnabled() {
  return smtpEnabled() || gmailEnabled() || Boolean(process.env.RESEND_API_KEY);
}

/** Sends each message separately. Returns how many went, and the first error if any failed. */
export async function sendMailEach(messages: (Mail & { replyTo?: string })[]): Promise<{ sent: number; failed: string[]; error?: string }> {
  const failed: string[] = [];
  let error: string | undefined;
  if (smtpEnabled() || gmailEnabled()) {
    const nodemailer = await import("nodemailer");
    const transport = smtpEnabled()
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.office365.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          requireTLS: Number(process.env.SMTP_PORT) !== 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        })
      : nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    const sender = smtpEnabled() ? process.env.SMTP_USER : process.env.GMAIL_USER;
    const from = process.env.EMAIL_FROM || `Territory Spotless Cleaning Services <${sender}>`;
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
  const from = process.env.EMAIL_FROM || "Territory Spotless <onboarding@resend.dev>";
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

/** The email that carries an invoice: the amount, due date, bank details and a link to view or print it. */
export function invoiceEmail(settings: Settings, input: { number: string; name: string; total: string; dueDate: string; link: string; taxInvoice: boolean; bank: string }) {
  const kind = input.taxInvoice ? "Tax invoice" : "Invoice";
  const html = shell(settings, `
    <h1 style="font-size:22px;margin:0 0 12px">${kind} ${escapeHtml(input.number)}</h1>
    <p>Hi ${escapeHtml(input.name)}, thanks for choosing ${escapeHtml(settings.shortName)}. Here is your invoice.</p>
    <p style="font-size:20px;margin:16px 0"><strong>Amount due: ${escapeHtml(input.total)}</strong>${input.dueDate ? `<br><span style="font-size:15px">Due ${escapeHtml(input.dueDate)}</span>` : ""}</p>
    <p><a href="${input.link}" style="display:inline-block;background:#0F2D4F;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">View or print the invoice</a></p>
    ${input.bank ? `<p style="margin-top:16px"><strong>Pay by bank transfer</strong><br>${escapeHtml(input.bank).replace(/\n/g, "<br>")}<br>Reference: ${escapeHtml(input.number)}</p>` : ""}
    <p style="margin-top:16px;font-size:13px;color:#4A5D75">Questions? Call ${escapeHtml(settings.phoneDisplay)} or reply to this email.</p>
  `);
  const text = [`${kind} ${input.number}`, `Hi ${input.name}, here is your invoice from ${settings.shortName}.`, `Amount due: ${input.total}${input.dueDate ? `, due ${input.dueDate}` : ""}`, `View or print: ${input.link}`, input.bank ? `Pay by bank transfer:\n${input.bank}\nReference: ${input.number}` : "", `Questions? Call ${settings.phoneDisplay}.`].filter(Boolean).join("\n\n");
  return { subject: `${kind} ${input.number} from ${settings.shortName} – ${input.total}`, html, text };
}

/** A quote: the covering message as written in the admin, a summary box and a button to view and accept. */
export function quoteEmail(settings: Settings, input: { number: string; message: string; total: string; validUntil: string; link: string }) {
  const paragraphs = input.message.split(/\n{2,}/).filter((part) => part.trim()).map((part) => `<p style="margin:0 0 14px">${escapeHtml(part).replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#1F63B4">$1</a>')}</p>`).join("");
  const html = shell(settings, `
    <div style="background:#F2F6FB;border-radius:12px;padding:14px 16px;margin:0 0 18px">
      <div style="font-size:12px;letter-spacing:2px;color:#566476;font-weight:700">QUOTE ${escapeHtml(input.number)}</div>
      <div style="font-size:24px;font-weight:700;color:#0F2D4F;margin-top:4px">${escapeHtml(input.total)}</div>
      ${input.validUntil ? `<div style="font-size:13px;color:#566476">Valid until ${escapeHtml(input.validUntil)}</div>` : ""}
    </div>
    ${paragraphs}
    <p style="margin:18px 0 0"><a href="${input.link}" style="display:inline-block;background:#2F9E4F;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">View &amp; accept your quote</a></p>
  `);
  return { subject: `Your quote ${input.number} from ${settings.shortName} – ${input.total}`, html, text: input.message };
}

/** Tells the owner a customer accepted (or declined) a quote from their link. */
export function quoteResponseEmail(settings: Settings, input: { number: string; name: string; phone: string; email: string; total: string; accepted: boolean; adminLink: string }) {
  const verb = input.accepted ? "accepted" : "declined";
  const html = shell(settings, `
    <h1 style="font-size:21px;margin:0 0 10px">${input.accepted ? "✅" : "❌"} Quote ${escapeHtml(input.number)} ${verb}</h1>
    ${row("Customer", input.name)}${row("Phone", input.phone)}${row("Email", input.email)}${row("Total", input.total)}
    <p style="margin-top:16px"><a href="${input.adminLink}" style="display:inline-block;background:#0F2D4F;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Open the quote</a></p>
    ${input.accepted ? `<p style="font-size:13px;color:#566476">Next: call them to lock in a time, then use “Book job” on the quote.</p>` : ""}
  `);
  const text = `Quote ${input.number} ${verb} by ${input.name} (${input.phone || input.email}). Total ${input.total}. ${input.adminLink}`;
  return { subject: `Quote ${input.number} ${verb} – ${input.name}`, html, text };
}
