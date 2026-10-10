import { MessagesComposer } from "@/components/admin/messages";
import { getDb } from "@/lib/store";
import { byOrder, siteUrl } from "@/lib/utils";

export default async function MessagesPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Send offers</h1>
      <p className="mb-5 mt-1 text-slate">Send an offer or promo code to customers on WhatsApp or by text, and keep a record of who got it.</p>
      <MessagesComposer customers={db.customers} offers={byOrder(db.offers)} promos={db.promos} campaigns={db.campaigns} siteUrl={siteUrl()} />
    </div>
  );
}
