import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Logo({ className }: Props) {
  return (
    <span className={cn("brand-logo text-2xl uppercase", className)}>
      RachaConta
    </span>
  );
}
