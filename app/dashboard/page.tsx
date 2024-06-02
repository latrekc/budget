"use client";
import dynamic from "next/dynamic";

import Header, { PageType } from "@/components/Header";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
});

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
