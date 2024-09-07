"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { RelayEnvironmentProvider } from "react-relay";

import { FiltersProvider } from "./components/Filters/FiltersProvider";
import { environment } from "./lib/relay";
import { PubSubProvider } from "./lib/usePubSub";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RelayEnvironmentProvider environment={environment}>
      <NextUIProvider navigate={router.push}>
        <PubSubProvider>
          <FiltersProvider>{children}</FiltersProvider>
        </PubSubProvider>
      </NextUIProvider>
    </RelayEnvironmentProvider>
  );
}
