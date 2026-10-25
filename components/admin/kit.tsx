"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

/** A form panel: slides up as a full sheet on phones, a centred card on bigger screens. */
export function Sheet({ open, onOpenChange, title, description, children, trigger }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: React.ReactNode; trigger?: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[81] flex max-h-[92svh] flex-col rounded-t-[28px] bg-white shadow-soft sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88vh] sm:w-[min(94vw,640px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 pb-4 pt-5">
            <div>
              <Dialog.Title className="text-xl font-bold text-navy">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-0.5 text-sm text-slate">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-navy hover:bg-brand-light" aria-label="Close"><X className="h-5 w-5" aria-hidden /></Dialog.Close>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** A row of filter chips with counts ("All 12 · New 3 · …"). Scrolls sideways on phones. */
export function FilterChips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (value: T) => void; options: { id: T; label: string; count?: number; tone?: string }[]; label: string }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label={label}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-95", active ? "bg-navy text-white shadow-card" : "bg-white text-navy ring-1 ring-line hover:ring-brand")}
          >
            {option.label}
            {option.count !== undefined && <span className={cn("rounded-full px-1.5 text-xs font-bold", active ? "bg-white/20 text-white" : option.tone || "bg-mist text-slate")}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Small round icon button used in table rows (call, WhatsApp, open…). */
export function IconLink({ href, label, children, className, external }: { href: string; label: string; children: React.ReactNode; className?: string; external?: boolean }) {
  return (
    <a href={href} aria-label={label} title={label} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-navy transition hover:bg-brand-light hover:text-brand", className)}>
      {children}
    </a>
  );
}

export function CategoryBadges({ ids, labels }: { ids: string[]; labels: Record<string, string> }) {
  if (!ids.length) return <span className="inline-flex rounded-full bg-mist px-2 py-0.5 text-xs font-semibold text-slate">Other</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {ids.map((id) => <span key={id} className="inline-flex rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand">{labels[id] ?? id}</span>)}
    </span>
  );
}

/** A small bin button that asks first, runs a delete action and refreshes the page. */
export function DeleteButton({ label, title, body, action, after }: { label: string; title: string; body: string; action: () => Promise<{ ok: boolean; error?: string; message?: string }>; after?: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <ConfirmDialog
      title={title}
      body={body}
      confirmLabel="Delete"
      onConfirm={() => start(async () => {
        const result = await action();
        toast(result.ok ? result.message || "Deleted" : result.error || "Couldn't delete", result.ok ? "ok" : "error");
        if (!result.ok) return;
        if (after) after();
        else router.refresh();
      })}
      trigger={<Button type="button" size="icon" variant="ghost" disabled={pending} aria-label={label} title={label} className="h-9 w-9 text-danger hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden /></Button>}
    />
  );
}
