import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-sm font-semibold text-ink", className)} {...props} />;
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-[52px] w-full rounded-input border border-[#c5dde2] bg-white px-4 text-ink placeholder:text-slate/70",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn("min-h-32 w-full rounded-input border border-[#c5dde2] bg-white px-4 py-3 text-ink placeholder:text-slate/70", className)}
      {...props}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-[#9e2a2a]">{message}</p>;
}
