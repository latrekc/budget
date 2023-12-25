import { graphql, useLazyLoadQuery } from "react-relay";
import TransactionsTable from "./TransactionsTable";
import { TransactionsQuery } from "./__generated__/TransactionsQuery.graphql";

export default function Transactions() {
  const data = useLazyLoadQuery<TransactionsQuery>(
    graphql`
      query TransactionsQuery($first: Int, $after: ID) {
        ...TransactionsTable_transactions
      }
    `,
    { first: 20 },
  );
  return <TransactionsTable transactions={data} />;
}
