import { OffersEditor } from "@/components/admin/editors";
import { getDb } from "@/lib/store";

export default async function OffersPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">Offers and promo codes</h1><OffersEditor offers={db.offers} promos={db.promos} /></div>;
}
