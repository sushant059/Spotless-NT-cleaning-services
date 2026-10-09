import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        sun: "bg-sun text-ink hover:brightness-95",
        teal: "bg-teal text-white hover:bg-teal-deep",
        outline: "border-2 border-teal-deep bg-white text-teal-deep hover:bg-sky",
        ghost: "bg-transparent text-ink hover:bg-white/70",
        whatsapp: "bg-whatsapp text-ink hover:brightness-95",
        danger: "border-2 border-danger bg-white text-danger hover:bg-red-50",
      },
      size: {
        md: "min-h-[52px] px-6 text-base",
        sm: "min-h-11 px-4 text-sm",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "sun", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
