import { cn } from "@/lib/utils"

type SiteContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  bleed?: boolean
}

export function SiteContainer({
  className,
  bleed = false,
  ...props
}: SiteContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1200px]",
        bleed ? "px-0" : "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
}





