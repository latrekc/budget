import { Currency, DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { Chip, Tab, Tabs } from "@nextui-org/react";
import { useEffect, useMemo } from "react";
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from "react-relay";
import CurrencyIcon from "../CurrencyIcon";
import { Currencies$key } from "./__generated__/Currencies.graphql";
import { CurrenciesQuery as CurrenciesQueryType } from "./__generated__/CurrenciesQuery.graphql";
import CurrencyRates from "./CurrencyRates";

export const CurrenciesQuery = graphql`
  query CurrenciesQuery($base: Currency!) {
    ...Currencies
  }
`;

export default function Currencies({
  preloadedQuery,
}: {
  preloadedQuery: PreloadedQuery<CurrenciesQueryType>;
}) {
  const data = usePreloadedQuery<CurrenciesQueryType>(
    CurrenciesQuery,
    preloadedQuery,
  );

  const [{ currencies }, refetch] = useRefetchableFragment(
    graphql`
      fragment Currencies on Query
      @refetchable(queryName: "CurrenciesRefetchQuery") {
        currencies(base: $base) {
          currency @required(action: THROW)
          rateClaims @required(action: THROW)
          rates @required(action: THROW)
        }
      }
    `,
    data as Currencies$key,
  );

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.CurrencyExchangeRates, () => {
      refetch({ base: DEFAULT_CURRENCY }, { fetchPolicy: "network-only" });
    });
  }, [refetch, subscribe]);

  const items = useMemo(
    () =>
      currencies
        ? [...currencies].filter(
            ({ rateClaims, rates }) => rates > 0 || rateClaims > 0,
          )
        : [],
    [currencies],
  );

  return (
    <div className="p-3">
      <Tabs items={items}>
        {({ currency, rateClaims }) => (
          <Tab
            key={currency}
            title={
              <div className="flex items-center space-x-2">
                <CurrencyIcon currency={currency as Currency} />
                <span>{currency}</span>
                {rateClaims > 0 ? <Chip size="sm">{rateClaims}</Chip> : null}
              </div>
            }
          >
            <CurrencyRates currency={currency as Currency} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
