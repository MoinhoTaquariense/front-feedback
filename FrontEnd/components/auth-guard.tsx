"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

const isPublicRoute = (pathname: string) =>
  pathname === "/login" ||
  pathname === "/questionario" ||
  pathname === "/questionarioPV" ||
  pathname === "/questionarioCM" ||
  pathname === "/questionarioFN" ||
  pathname === "/obrigado" ||
  pathname === "/usado" ||
  pathname.startsWith("/responder/");

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, papel, sessionReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (sessionReady && !isPublicRoute(pathname) && !token)
      router.replace("/login");
    if (
      sessionReady &&
      token &&
      pathname.startsWith("/administracao") &&
      papel !== "RH_MASTER"
    )
      router.replace("/");
  }, [papel, pathname, router, sessionReady, token]);
  if (!isPublicRoute(pathname) && !sessionReady) return null;
  if (pathname.startsWith("/administracao") && papel !== "RH_MASTER")
    return null;
  return <>{children}</>;
}
