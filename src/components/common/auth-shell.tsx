import { cn } from "@/lib/utils"
import { ApplicationLogo } from "./application-logo"
import { AuroraBackdrop } from "@/components/landing/hero/AuroraBackdrop"

interface AuthShellProps {
  children: React.ReactNode
  className?: string
  headline?: string
  subcopy?: string
}

export function AuthShell({
  children,
  className,
  headline = "Docs that keep up with your code",
  subcopy = "Generate clear documentation from your repositories and keep it current,without slowing your team down.",
}: AuthShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:w-[45%] flex-col p-10 text-white">
        <AuroraBackdrop variant="fill" />

        <div className="relative z-10 flex h-full flex-col">
          <ApplicationLogo link="/" forceTheme="dark" />

          <div className="flex flex-1 flex-col justify-center py-12">
            <div className="max-w-md space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {headline}
              </h2>
              <p className="leading-relaxed text-white/70">{subcopy}</p>
            </div>
          </div>

          <p className="relative z-10 shrink-0 select-none text-xs text-white/50">
            © {new Date().getFullYear()} Docnine, Seablings Technology. All
            rights reserved.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "guest-landing flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-6 py-12 text-foreground sm:px-10",
          className,
        )}
      >
        <div className="mb-10 lg:hidden">
          <ApplicationLogo link="/" className="!h-7" />
        </div>

        <div className="w-full max-w-[400px]">{children}</div>

        <p className="mt-10 select-none text-[12px] text-muted-foreground/50 lg:hidden">
          © {new Date().getFullYear()} Docnine
        </p>
      </div>
    </div>
  )
}
