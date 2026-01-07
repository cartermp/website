"use client";

import { usePathname } from "next/navigation";

interface SidebarAboutPanelProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarAboutPanel({ className = "", children }: SidebarAboutPanelProps) {
  const pathname = usePathname();
  const isPostPage = pathname?.startsWith("/posts/") ?? false;
  const visibility = isPostPage ? "hidden lg:block" : "";

  return <div className={`${visibility} ${className}`.trim()}>{children}</div>;
}
