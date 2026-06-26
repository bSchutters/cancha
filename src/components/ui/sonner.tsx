"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  // Use the *resolved* theme (actual light/dark applied), not the chosen one
  // (which can be "system" and follow the OS, mismatching the app). Default to
  // light — the product/console DA is light cream by default and some surfaces
  // (e.g. /console) mount no next-themes provider.
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "light"}
      className="toaster group"
      style={
        {
          // Use the themed "secondary" surface (warm cream in the Papier DA)
          // instead of the popover surface, which is pure white in several
          // palettes and made toasts look cold/off-theme on a cream page.
          "--normal-bg": "var(--secondary)",
          "--normal-text": "var(--secondary-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
