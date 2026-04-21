import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SecondaryPrimaryButtonProps = React.ComponentProps<typeof Button>

/**
 * Secondary action control: soft primary-tinted surface with primary-family icon/text
 * (WCAG-friendly on light UI; light icon on dark).
 */
export function SecondaryPrimaryButton({
  className,
  ...props
}: SecondaryPrimaryButtonProps) {
  return (
    <Button variant="primaryMuted" className={cn(className)} {...props} />
  )
}
