import { graphql, useLazyLoadQuery } from "react-relay";
import TransactionsCategories from "./TransactionsCategories";
import TransactionsStatistic from "./TransactionsStatistic";
import TransactionsTable, { PER_PAGE } from "./TransactionsTable";
import { TransactionsQuery } from "./__generated__/TransactionsQuery.graphql";

export default function Transactions() {
  const data = useLazyLoadQuery<TransactionsQuery>(
    graphql`
      query TransactionsQuery($first: Int, $after: ID) {
        ...TransactionsTable_transactions
        ...TransactionsStatistic_statistic
        ...TransactionsCategories_categories
      }
    `,
    { first: PER_PAGE },
  );

  return (
    <>
      <div className="flex flex-row">
        <div className="basis-3/4">
          <TransactionsTable transactions={data} />
        </div>
        <div className="basis-1/4">
          <TransactionsCategories categories={data} />
        </div>
      </div>
      <TransactionsStatistic statistic={data} />
    </>
  );
}
