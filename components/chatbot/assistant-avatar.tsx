import { Bot } from "lucide-react"

export function AssistantAvatar() {
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
      <Bot className="w-5 h-5 text-primary-foreground" aria-hidden />
    </div>
  )
}
