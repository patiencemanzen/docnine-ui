import { Link } from "react-router-dom";
import { useTheme } from "../../providers/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LogoTheme = "light" | "dark";

function resolveTheme(theme: string): LogoTheme {
  if (theme === "dark" || theme === "light") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ApplicationLogo({
  link,
  className,
  forceTheme,
}: {
  link?: string;
  className?: string;
  forceTheme?: LogoTheme;
}) {
  const { theme } = useTheme();
  const [resolved, setResolved] = useState<LogoTheme>(() => forceTheme ?? resolveTheme(theme));

  useEffect(() => {
    if (forceTheme) {
      setResolved(forceTheme);
      return;
    }

    setResolved(resolveTheme(theme));

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, forceTheme]);

  return (
    <Link to={link || "/"} className="inline-flex w-fit shrink-0">
      <img
        src={resolved === "dark" ? "/logo-dark.png" : "/logo-light.png"}
        alt="Docnine Logo"
        className={cn("h-8 w-auto", className)}
      />
    </Link>
  );
}
