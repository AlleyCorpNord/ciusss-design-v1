import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface SourceLinkProps {
  href: string
  children: ReactNode
  className?: string
  target?: ComponentPropsWithoutRef<"a">["target"]
  rel?: string
}

export function SourceLink({
  href,
  children,
  className,
  target,
  rel,
}: SourceLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "text-primary-on-background inline-flex items-center gap-1",
        className
      )}
    >
      <span className="underline underline-offset-2">{children}</span>
      <ExternalLink className="w-3 h-3 shrink-0" />
    </a>
  )
}
