"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { RelayEnvironmentProvider } from "react-relay";
import { environment } from "./lib/relay";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RelayEnvironmentProvider environment={environment}>
      <NextUIProvider navigate={router.push}>{children}</NextUIProvider>
    </RelayEnvironmentProvider>
  );
}
