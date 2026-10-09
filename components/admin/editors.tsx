"use client";

import { useState, useTransition } from "react";
import { MediaImage } from "@/components/media-image";
import { useRouter } from "next/navigation";
import {
  assignMediaAction,
  createServiceAction,
  deleteFaqAction,
  deleteMediaAction,
  deleteOfferAction,
  deletePromoAction,
  deleteResultAction,
  deleteReviewAction,
  reorderAction,
  resetLocalDataAction,
  saveFaqAction,
  saveOfferAction,
  savePromoAction,
  saveResultAction,
  saveReviewAction,
  saveServiceAction,
  saveSettingsAction,
  uploadMediaAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import type { Faq, MediaItem, Offer, Promo, ResultPair, Review, Service, Settings } from "@/lib/types";
import { byOrder, uid } from "@/lib/utils";

function useSave() {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  function run(work: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    start(async () => {
      const result = await work();
      toast(result.ok ? result.message || "Saved" : result.error || "Could not save", result.ok ? "ok" : "error");
      if (result.ok) router.refresh();
    });
  }
  return { pending, run };
}

export function OffersEditor({ offers, promos }: { offers: Offer[]; promos: Promo[] }) {
  const { pending, run } = useSave();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [promo, setPromo] = useState<Promo | null>(null);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setOffer({ id: uid("offer"), title: "", description: "", bannerText: "", href: "/free-quote", image: "", active: true, startsAt: "", endsAt: "", showOnBanner: false, order: offers.length + 1 })}>New offer</Button>
      </div>
      {byOrder(offers).map((item) => (
        <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{item.title}</h2>
            <span className="text-sm font-semibold">{item.active ? "Active" : "Hidden"}</span>
          </div>
          <p className="mt-2 text-sm text-slate">{item.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setOffer(item)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("offers", item.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("offers", item.id, 1))}>Down</Button>
            <ConfirmDialog title="Delete offer?" body="The public site will stop showing it." confirmLabel="Delete" onConfirm={() => run(() => deleteOfferAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
      {offer && (
        <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveOfferAction(offer)); }}>
          <h2 className="text-xl font-bold">Edit offer</h2>
          <Label htmlFor="offer-title">Title</Label>
          <Input id="offer-title" value={offer.title} onChange={(event) => setOffer({ ...offer, title: event.target.value })} />
          <Label htmlFor="offer-description">Description</Label>
          <Textarea id="offer-description" value={offer.description} onChange={(event) => setOffer({ ...offer, description: event.target.value })} />
          <Label htmlFor="offer-banner">Banner text</Label>
          <Input id="offer-banner" value={offer.bannerText} onChange={(event) => setOffer({ ...offer, bannerText: event.target.value })} />
          <Label htmlFor="offer-href">Link</Label>
          <Input id="offer-href" value={offer.href} onChange={(event) => setOffer({ ...offer, href: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="offer-start">Starts</Label><Input id="offer-start" type="date" value={offer.startsAt} onChange={(event) => setOffer({ ...offer, startsAt: event.target.value })} /></div>
            <div><Label htmlFor="offer-end">Ends</Label><Input id="offer-end" type="date" value={offer.endsAt} onChange={(event) => setOffer({ ...offer, endsAt: event.target.value })} /></div>
          </div>
          <label className="flex gap-2"><input type="checkbox" checked={offer.active} onChange={(event) => setOffer({ ...offer, active: event.target.checked })} /> Active</label>
          <label className="flex gap-2"><input type="checkbox" checked={offer.showOnBanner} onChange={(event) => setOffer({ ...offer, showOnBanner: event.target.checked })} /> Show in the top banner</label>
          <Button type="submit" disabled={pending}>Save offer</Button>
        </form>
      )}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Promo codes</h2>
          <Button type="button" size="sm" onClick={() => setPromo({ id: uid("promo"), code: "", type: "percent", amount: 10, message: "We'll confirm this discount when we call.", expiresAt: "", usageLimit: 50, usedCount: 0, active: true })}>New code</Button>
        </div>
        {promos.map((item) => (
          <article key={item.id} className="mb-3 rounded-card bg-white p-4 shadow-card">
            <p className="font-bold">{item.code} · {item.type === "percent" ? `${item.amount}%` : `$${item.amount}`} · used {item.usedCount}{item.usageLimit != null ? ` / ${item.usageLimit}` : ""}</p>
            <p className="text-sm text-slate">{item.message}</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setPromo(item)}>Edit</Button>
              <ConfirmDialog title="Delete code?" body="People will no longer be able to use it." confirmLabel="Delete" onConfirm={() => run(() => deletePromoAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
            </div>
          </article>
        ))}
        {promo && (
          <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => savePromoAction(promo)); }}>
            <Label htmlFor="promo-code">Code</Label>
            <Input id="promo-code" value={promo.code} onChange={(event) => setPromo({ ...promo, code: event.target.value.toUpperCase() })} />
            <Label htmlFor="promo-type">Type</Label>
            <select id="promo-type" className="min-h-[52px] rounded-input border px-3" value={promo.type} onChange={(event) => setPromo({ ...promo, type: event.target.value as Promo["type"] })}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
            <Label htmlFor="promo-amount">Amount</Label>
            <Input id="promo-amount" type="number" value={promo.amount} onChange={(event) => setPromo({ ...promo, amount: Number(event.target.value) })} />
            <Label htmlFor="promo-message">Message customers see</Label>
            <Textarea id="promo-message" value={promo.message} onChange={(event) => setPromo({ ...promo, message: event.target.value })} />
            <Label htmlFor="promo-expiry">Expiry</Label>
            <Input id="promo-expiry" type="date" value={promo.expiresAt} onChange={(event) => setPromo({ ...promo, expiresAt: event.target.value })} />
            <Label htmlFor="promo-limit">Usage limit (blank for none)</Label>
            <Input id="promo-limit" value={promo.usageLimit ?? ""} onChange={(event) => setPromo({ ...promo, usageLimit: event.target.value === "" ? null : Number(event.target.value) })} />
            <label className="flex gap-2"><input type="checkbox" checked={promo.active} onChange={(event) => setPromo({ ...promo, active: event.target.checked })} /> Active</label>
            <Button type="submit" disabled={pending}>Save code</Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function ServicesEditor({ services }: { services: Service[] }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState<Service | null>(null);
  const [title, setTitle] = useState("");
  return (
    <div className="space-y-4">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); run(async () => { const result = await createServiceAction(title); if (result.ok) setTitle(""); return result; }); }}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New service name" aria-label="New service name" />
        <Button type="submit" size="sm">Add hidden service</Button>
      </form>
      {byOrder(services).map((service) => (
        <article key={service.id} className="rounded-card bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{service.title}</h2>
            <label className="text-sm font-semibold"><input type="checkbox" className="mr-2" checked={service.visible} onChange={(event) => run(() => saveServiceAction({ ...service, visible: event.target.checked }))} />Visible</label>
          </div>
          <p className="text-sm text-slate">/{service.slug}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(service)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("services", service.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("services", service.id, 1))}>Down</Button>
          </div>
        </article>
      ))}
      {current && (
        <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveServiceAction(current)); }}>
          <h2 className="text-xl font-bold">Edit {current.title}</h2>
          <Label>Title</Label>
          <Input value={current.title} onChange={(event) => setCurrent({ ...current, title: event.target.value })} />
          <Label>Short summary</Label>
          <Textarea value={current.summary} onChange={(event) => setCurrent({ ...current, summary: event.target.value })} />
          <Label>Description</Label>
          <Textarea value={current.description} onChange={(event) => setCurrent({ ...current, description: event.target.value })} />
          <Label>Included, one per line</Label>
          <Textarea value={current.included.join("\n")} onChange={(event) => setCurrent({ ...current, included: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} />
          <Label>Best for, one per line</Label>
          <Textarea value={current.bestFor.join("\n")} onChange={(event) => setCurrent({ ...current, bestFor: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} />
          <Label>Image URL</Label>
          <Input value={current.image} onChange={(event) => setCurrent({ ...current, image: event.target.value })} />
          <Label>Video URL</Label>
          <Input value={current.videoUrl} onChange={(event) => setCurrent({ ...current, videoUrl: event.target.value })} />
          <Button type="submit" disabled={pending}>Save service</Button>
        </form>
      )}
    </div>
  );
}

export function ResultsEditor({ results, services }: { results: ResultPair[]; services: Service[] }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState<ResultPair>({ id: uid("ba"), serviceSlug: services[0]?.slug || "carpet-cleaning", caption: "", scene: "carpet", beforeImage: "", afterImage: "", illustrative: true, order: results.length + 1 });
  async function fileToData(file: File) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) return "";
    const data = new FormData();
    data.set("file", new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
    data.set("slot", "gallery");
    const uploaded = await uploadMediaAction(data);
    return uploaded.ok ? uploaded.url || "" : "";
  }
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveResultAction(current)); }}>
        <h2 className="text-xl font-bold">Add or replace a pair</h2>
        <Label htmlFor="result-service">Service</Label>
        <select id="result-service" className="min-h-[52px] rounded-input border px-3" value={current.serviceSlug} onChange={(event) => setCurrent({ ...current, serviceSlug: event.target.value, scene: event.target.value })}>
          {services.map((service) => <option key={service.id} value={service.slug}>{service.title}</option>)}
        </select>
        <Label htmlFor="result-caption">Caption</Label>
        <Input id="result-caption" value={current.caption} onChange={(event) => setCurrent({ ...current, caption: event.target.value })} />
        <Label htmlFor="result-before">Before photo</Label>
        <Input id="result-before" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const url = await fileToData(file); if (url) setCurrent((item) => ({ ...item, beforeImage: url })); }} />
        <Label htmlFor="result-after">After photo</Label>
        <Input id="result-after" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const url = await fileToData(file); if (url) setCurrent((item) => ({ ...item, afterImage: url })); }} />
        <label className="flex gap-2"><input type="checkbox" checked={current.illustrative} onChange={(event) => setCurrent({ ...current, illustrative: event.target.checked })} /> Mark as illustrative</label>
        <Button type="submit" disabled={pending}>Save pair</Button>
      </form>
      {byOrder(results).map((item) => (
        <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="font-bold">{item.caption || item.serviceSlug}</p>
          <p className="text-sm text-slate">{item.illustrative ? "Illustrative" : "Real job photo"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("results", item.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("results", item.id, 1))}>Down</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(item)}>Edit</Button>
            <ConfirmDialog title="Delete this pair?" body="The public gallery will no longer show it." confirmLabel="Delete" onConfirm={() => run(() => deleteResultAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function MediaEditor({ media, services }: { media: MediaItem[]; services: Service[] }) {
  const { run } = useSave();
  const [slot, setSlot] = useState("gallery");
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("slot", slot);
        run(() => uploadMediaAction(data));
        event.currentTarget.reset();
      }}>
        <Label htmlFor="media-file">Upload</Label>
        <Input id="media-file" name="file" type="file" accept="image/*,video/mp4,video/webm" required />
        <Label htmlFor="media-slot">Use it as</Label>
        <select id="media-slot" className="min-h-[52px] rounded-input border px-3" value={slot} onChange={(event) => setSlot(event.target.value)}>
          <option value="gallery">Gallery only</option>
          <option value="hero-image">Hero image</option>
          <option value="hero-video">Hero video</option>
          <option value="team-photo">Team photo</option>
          <option value="og-image">Social share image</option>
          {services.map((service) => <option key={service.id} value={`service-video:${service.slug}`}>{service.title} video</option>)}
          {services.map((service) => <option key={`${service.id}-image`} value={`service-image:${service.slug}`}>{service.title} image</option>)}
        </select>
        <Button type="submit">Upload</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">
        {media.map((item) => (
          <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
            {item.kind === "image" ? <MediaImage src={item.url} alt="" className="aspect-video w-full rounded-2xl object-cover" /> : <video src={item.url} className="aspect-video w-full rounded-2xl" controls />}
            <p className="mt-2 text-sm font-semibold">{item.name}</p>
            <p className="text-sm text-slate">{item.slot || "gallery"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => run(() => assignMediaAction(item.url, slot))}>Assign selected use</Button>
              <ConfirmDialog title="Remove from the library?" body="The file may still exist in storage, but the site will stop listing it." confirmLabel="Remove" onConfirm={() => run(() => deleteMediaAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ReviewsEditor({ reviews }: { reviews: Review[] }) {
  const { pending, run } = useSave();
  const blank = (): Review => ({ id: uid("rev"), name: "", text: "", service: "", rating: 5, date: new Date().toISOString().slice(0, 10), source: "manual", visible: true, order: reviews.length + 1 });
  const [current, setCurrent] = useState<Review>(blank());
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(async () => { const result = await saveReviewAction(current); if (result.ok) setCurrent(blank()); return result; }); }}>
        <Label htmlFor="review-name">Name</Label>
        <Input id="review-name" value={current.name} onChange={(event) => setCurrent({ ...current, name: event.target.value })} />
        <Label htmlFor="review-text">Review</Label>
        <Textarea id="review-text" value={current.text} onChange={(event) => setCurrent({ ...current, text: event.target.value })} />
        <Label htmlFor="review-service">Service</Label>
        <Input id="review-service" value={current.service} onChange={(event) => setCurrent({ ...current, service: event.target.value })} />
        <Label htmlFor="review-rating">Stars</Label>
        <Input id="review-rating" type="number" min={1} max={5} value={current.rating} onChange={(event) => setCurrent({ ...current, rating: Number(event.target.value) })} />
        <label className="flex gap-2"><input type="checkbox" checked={current.visible} onChange={(event) => setCurrent({ ...current, visible: event.target.checked })} /> Visible</label>
        <label className="flex gap-2"><input type="checkbox" checked={current.source === "sample"} onChange={(event) => setCurrent({ ...current, source: event.target.checked ? "sample" : "manual" })} /> Mark as sample</label>
        <Button type="submit" disabled={pending}>Save review</Button>
      </form>
      {byOrder(reviews).map((review) => (
        <article key={review.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="font-bold">{review.name} · {review.source}{review.visible ? "" : " · hidden"}</p>
          <p className="mt-1 text-sm">{review.text}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(review)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => saveReviewAction({ ...review, visible: !review.visible }))}>{review.visible ? "Hide" : "Show"}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("reviews", review.id, -1))}>Up</Button>
            <ConfirmDialog title="Delete review?" body="It will disappear from the public site." confirmLabel="Delete" onConfirm={() => run(() => deleteReviewAction(review.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function FaqsEditor({ faqs }: { faqs: Faq[] }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState<Faq>({ id: uid("faq"), category: "Booking", question: "", answer: "", order: faqs.length + 1 });
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveFaqAction(current)); }}>
        <Label htmlFor="faq-category">Category</Label>
        <Input id="faq-category" value={current.category} onChange={(event) => setCurrent({ ...current, category: event.target.value })} />
        <Label htmlFor="faq-question">Question</Label>
        <Input id="faq-question" value={current.question} onChange={(event) => setCurrent({ ...current, question: event.target.value })} />
        <Label htmlFor="faq-answer">Answer</Label>
        <Textarea id="faq-answer" value={current.answer} onChange={(event) => setCurrent({ ...current, answer: event.target.value })} />
        <Button type="submit" disabled={pending}>Save FAQ</Button>
      </form>
      {byOrder(faqs).map((faq) => (
        <article key={faq.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="text-sm font-semibold text-teal-deep">{faq.category}</p>
          <h2 className="font-bold">{faq.question}</h2>
          <div className="mt-2 flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(faq)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("faqs", faq.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("faqs", faq.id, 1))}>Down</Button>
            <ConfirmDialog title="Delete FAQ?" body="It will leave the public FAQ page." confirmLabel="Delete" onConfirm={() => run(() => deleteFaqAction(faq.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function SettingsEditor({ settings, localMode }: { settings: Settings; localMode: boolean }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState(settings);
  const areas = current.serviceAreas.join("\n");
  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); run(() => saveSettingsAction(current)); }}>
      <Field label="Business name" value={current.businessName} onChange={(value) => setCurrent({ ...current, businessName: value })} />
      <Field label="Short name" value={current.shortName} onChange={(value) => setCurrent({ ...current, shortName: value })} />
      <Field label="Phone" value={current.phoneDisplay} onChange={(value) => setCurrent({ ...current, phoneDisplay: value })} />
      <Field label="Phone link" value={current.phoneTel} onChange={(value) => setCurrent({ ...current, phoneTel: value })} />
      <Field label="WhatsApp URL" value={current.whatsappUrl} onChange={(value) => setCurrent({ ...current, whatsappUrl: value })} />
      <Field label="Public email" value={current.email} onChange={(value) => setCurrent({ ...current, email: value })} />
      <Field label="Notification email" value={current.notificationEmail} onChange={(value) => setCurrent({ ...current, notificationEmail: value })} />
      <Field label="Address" value={current.address} onChange={(value) => setCurrent({ ...current, address: value })} />
      <label className="block text-sm font-semibold">Service areas, one per line
        <Textarea className="mt-1 font-normal" value={areas} onChange={(event) => setCurrent({ ...current, serviceAreas: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} />
      </label>
      <Field label="Facebook" value={current.facebook} onChange={(value) => setCurrent({ ...current, facebook: value })} />
      <Field label="Instagram" value={current.instagram} onChange={(value) => setCurrent({ ...current, instagram: value })} />
      <Field label="TikTok" value={current.tiktok} onChange={(value) => setCurrent({ ...current, tiktok: value })} />
      <Field label="Google reviews link" value={current.google} onChange={(value) => setCurrent({ ...current, google: value })} />
      <Field label="ABN" value={current.abn} onChange={(value) => setCurrent({ ...current, abn: value })} />
      <Field label="Licence" value={current.licence} onChange={(value) => setCurrent({ ...current, licence: value })} />
      <Field label="Insurance" value={current.insurance} onChange={(value) => setCurrent({ ...current, insurance: value })} />
      <div className="grid gap-2">
        {current.openingHours.map((hour, index) => (
          <label key={hour.day} className="grid gap-1 text-sm font-semibold sm:grid-cols-[140px_1fr] sm:items-center">{hour.day}
            <Input value={hour.hours} onChange={(event) => setCurrent({ ...current, openingHours: current.openingHours.map((item, itemIndex) => itemIndex === index ? { ...item, hours: event.target.value } : item) })} />
          </label>
        ))}
      </div>
      <Field label="SEO title" value={current.seoTitle} onChange={(value) => setCurrent({ ...current, seoTitle: value })} />
      <label className="block text-sm font-semibold">SEO description
        <Textarea className="mt-1 font-normal" value={current.seoDescription} onChange={(event) => setCurrent({ ...current, seoDescription: event.target.value })} />
      </label>
      <Field label="Hero headline" value={current.heroHeadline} onChange={(value) => setCurrent({ ...current, heroHeadline: value })} />
      <label className="block text-sm font-semibold">Hero subtext
        <Textarea className="mt-1 font-normal" value={current.heroSubtext} onChange={(event) => setCurrent({ ...current, heroSubtext: event.target.value })} />
      </label>
      <p className="text-sm text-slate">Trust numbers stay hidden until you add a real figure and a label. Leave them blank rather than guessing.</p>
      {[0, 1, 2].map((index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Value" aria-label={`Stat ${index + 1} value`} value={current.stats[index]?.value || ""} onChange={(event) => {
            const stats = [...current.stats];
            stats[index] = { value: event.target.value, label: stats[index]?.label || "" };
            setCurrent({ ...current, stats });
          }} />
          <Input placeholder="Label" aria-label={`Stat ${index + 1} label`} value={current.stats[index]?.label || ""} onChange={(event) => {
            const stats = [...current.stats];
            stats[index] = { value: stats[index]?.value || "", label: event.target.value };
            setCurrent({ ...current, stats });
          }} />
        </div>
      ))}
      <Button type="submit" disabled={pending}>Save settings</Button>
      {localMode && <ConfirmDialog title="Restore starter content?" body="This puts the original services, FAQs and sample reviews back and clears local leads. Uploaded files in the uploads folder are left as they are." confirmLabel="Restore" onConfirm={() => run(() => resetLocalDataAction())} trigger={<Button type="button" variant="danger">Restore starter content</Button>} />}
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return <label className="block text-sm font-semibold" htmlFor={id}>{label}<Input id={id} className="mt-1 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
