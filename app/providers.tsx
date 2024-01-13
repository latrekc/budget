"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { RelayEnvironmentProvider } from "react-relay";
import { environment } from "./lib/relay";
import { PubSubProvider } from "./lib/usePubSub";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RelayEnvironmentProvider environment={environment}>
      <NextUIProvider navigate={router.push}>
        <PubSubProvider>{children}</PubSubProvider>
      </NextUIProvider>
    </RelayEnvironmentProvider>
  );
}
