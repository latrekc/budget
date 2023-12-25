"use client";

import { NextUIProvider } from "@nextui-org/react";
import { RelayEnvironmentProvider } from "react-relay";
import { environment } from "./lib/relay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <NextUIProvider>{children}</NextUIProvider>
    </RelayEnvironmentProvider>
  );
}
