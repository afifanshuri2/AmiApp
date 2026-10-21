import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-white hover:opacity-90",
        outline: "border border-[var(--line)] bg-white hover:bg-[var(--soft)]",
        ghost: "hover:bg-[var(--soft)]",
      },
      size: { default: "h-11 px-5", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
// shadcn/ui Button pattern: composable Radix Slot + CVA variants.
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(variants({ variant, size, className }))} {...props} />
  );
}
