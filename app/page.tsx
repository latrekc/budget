import Header from "./components/header";
import TransactionsTable from "./components/transactions/table";

import transactions from "./mock-transactions";

export default function Page() {
  return (
    <>
      <Header />

      <TransactionsTable transactions={transactions} />
    </>
  );
}
