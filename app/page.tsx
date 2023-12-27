"use client";

import Header from "./components/Header";
import Transactions from "./components/Transactions";

export default function Page() {
  return (
    <>
      <Header />
      <div suppressHydrationWarning>
        <Transactions />
      </div>
    </>
  );
}
