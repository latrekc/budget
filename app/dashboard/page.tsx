"use client";

import Dashboard from "@/components/Dashboard";
import Header, { PageType } from "@/components/Header";

export default function Page() {
  return (
    <>
      <Header active={PageType.Dashboard} />
      <div suppressHydrationWarning>
        <Dashboard />
      </div>
    </>
  );
}
