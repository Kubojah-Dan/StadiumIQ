import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "../lib/utils";

export function BrandMark({
  href = "/",
  className,
  iconClassName,
  textClassName,
}: {
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center", className)} aria-label="StadiumIQ">
      <Activity className={cn("h-6 w-6 text-primary animate-pulse-slow mr-2", iconClassName)} />
      <span
        className={cn(
          "text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent",
          textClassName,
        )}
      >
        StadiumIQ
      </span>
    </Link>
  );
}

