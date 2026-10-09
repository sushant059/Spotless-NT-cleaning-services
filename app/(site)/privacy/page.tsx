import type { Metadata } from "next";
import { PageHero } from "@/components/content";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Spotless NT Cleaning Services collects and uses personal information for quotes and bookings.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Privacy" title="Privacy policy" lede="This is a plain-language summary for customers in Australia. It is not a substitute for legal advice." />
      <section className="section pt-12">
        <div className="prose-page container-x card max-w-3xl space-y-4 p-6 text-slate md:p-10">
          <p>Spotless NT Cleaning Services collects your name, phone number, email, suburb, address, job details and any photos you choose to send. We use that information to quote, book and carry out cleaning, and to reply to you.</p>
          <p>The owner email for privacy requests is regmisushant94@gmail.com. You can ask what we hold about you and ask us to correct it. We delete quote photos and old enquiries when we no longer need them for the job or for ordinary record-keeping.</p>
          <p>We do not sell personal information. Staff and the service providers who host the website, store files or send email may handle it so the site can work. Those providers can include Vercel, Supabase and Resend, and their servers may be outside Australia. We only send what is needed to run the request.</p>
          <p>Forms use a hidden field and a simple rate limit to reduce spam. Do not send sensitive information we do not need, such as payment card numbers, through the website forms.</p>
          <p>The site may link to WhatsApp, phone and social networks. Those services have their own privacy policies once you leave this site.</p>
          <p>If you think we have handled your information poorly, contact us first. You can also contact the Office of the Australian Information Commissioner.</p>
        </div>
      </section>
    </>
  );
}
