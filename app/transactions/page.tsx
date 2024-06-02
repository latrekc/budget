"use client";
import dynamic from "next/dynamic";

import Header, { PageType } from "@/components/Header";

const Transactions = dynamic(() => import("@/components/Transactions"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Header active={PageType.Transactions} />
      <div suppressHydrationWarning>
        <Transactions />
      </div>
    </>
  );
}
