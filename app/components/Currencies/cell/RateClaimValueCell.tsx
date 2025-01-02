import { DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { FormEvent, useCallback, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { RateClaimValueCell$key } from "./__generated__/RateClaimValueCell.graphql";
import { RateClaimValueCellMutation } from "./__generated__/RateClaimValueCellMutation.graphql";

export default function RateClaimValueCell({
  claim: claim$key,
}: {
  claim: RateClaimValueCell$key;
}) {
  const { currency, date } = useFragment(
    graphql`
      fragment RateClaimValueCell on CurrencyExchangeRateClaim {
        date @required(action: THROW)
        currency @required(action: THROW)
      }
    `,
    claim$key,
  );

  const { publish } = usePubSub();

  const [commitMutation, isMutationInFlight] =
    useMutation<RateClaimValueCellMutation>(graphql`
      mutation RateClaimValueCellMutation(
        $base: Currency!
        $date: String!
        $target: Currency!
        $value: Float!
      ) {
        createCurrencyExhangeRate(
          base: $base
          date: $date
          target: $target
          value: $value
        ) {
          ... on MutationCreateCurrencyExhangeRateSuccess {
            data {
              id
              base
              date
              target
              rate
            }
          }
          ... on Error {
            message
          }
        }
      }
    `);

  const [valueStr, setValue] = useState<string>("");

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const value = parseFloat(valueStr);

      if (value == null || isNaN(value) || !(value > 0)) {
        alert("Not a valid number");
      } else {
        commitMutation({
          onCompleted(result) {
            if (result?.createCurrencyExhangeRate?.message) {
              alert(result.createCurrencyExhangeRate.message);
            } else {
              publish(PubSubChannels.CurrencyExchangeRates);
            }
          },

          variables: {
            base: DEFAULT_CURRENCY,
            date,
            target: currency,
            value,
          },
        });
      }
    },
    [commitMutation, currency, date, publish, valueStr],
  );

  return (
    <form onSubmit={onSubmit}>
      <input
        autoFocus
        className="w-20 rounded border-0 bg-gray-200 text-right text-base "
        disabled={isMutationInFlight}
        inputMode="numeric"
        onChange={(e) => setValue(e.currentTarget.value)}
        step="any"
        type="number"
      />
    </form>
  );
}
