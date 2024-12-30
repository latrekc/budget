import { Dispatch, useCallback } from "react";

import { Currency } from "@/lib/types";
import { Button, ButtonGroup } from "@nextui-org/react";
import {
  PiCurrencyDollarBold,
  PiCurrencyEurBold,
  PiCurrencyGbpBold,
  PiCurrencyRubBold,
} from "react-icons/pi";
import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../FiltersReducer";

export default function CurrencyFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
}) {
  const onToggleCurrency = useCallback(
    (currency: Currency) =>
      dispatch({
        payload: currency,
        type: FiltersReducerActionType.ToggleCurrency,
      }),
    [dispatch],
  );

  return (
    <ButtonGroup color="primary" size="sm" variant="solid">
      {Object.entries(Currency).map(([id, label]) => (
        <Button
          isIconOnly
          key={id}
          onClick={() => onToggleCurrency(label)}
          title={label}
          variant={
            filters.currencies === null || filters.currencies.includes(label)
              ? "solid"
              : "flat"
          }
        >
          <CurrencyIcon currency={label} />
        </Button>
      ))}
    </ButtonGroup>
  );
}

function CurrencyIcon({ currency }: { currency: Currency }) {
  switch (currency) {
    case Currency.GBP:
      return <PiCurrencyGbpBold />;
    case Currency.EUR:
      return <PiCurrencyEurBold />;
    case Currency.RUB:
      return <PiCurrencyRubBold />;
    case Currency.USD:
      return <PiCurrencyDollarBold />;
  }
}
