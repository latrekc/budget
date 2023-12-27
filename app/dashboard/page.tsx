"use client";

import Header, { PageType } from "@/components/Header";

export default function Page() {
  return (
    <>
      <Header active={PageType.Dashboard} />
      <div suppressHydrationWarning>Dashboard</div>
    </>
  );
}
