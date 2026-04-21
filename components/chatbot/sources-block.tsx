import { cn } from "@/lib/utils"
import { SourceLink } from "./source-link"

interface Source {
  title: string
  url?: string
}

interface SourcesBlockProps {
  sources: Source[]
  heading: string
  className?: string
}

export function SourcesBlock({ sources, heading, className }: SourcesBlockProps) {
  return (
    <div className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <span className="font-medium">{heading}</span>
      {sources.map((source, index) => (
        <span key={source.title} className="flex items-center gap-1">
          <SourceLink href={source.url || "#"}>{source.title}</SourceLink>
          {index < sources.length - 1 && (
            <span className="text-muted-foreground">·</span>
          )}
        </span>
      ))}
    </div>
  )
}
