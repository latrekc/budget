"use client";

import Header, { PageType } from "@/components/Header";
import Transactions from "@/components/Transactions";

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
