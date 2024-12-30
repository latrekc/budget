import { Currency } from "./Transactions/cell/__generated__/TransactionAmountCell.graphql";

export enum Size {
  Small,
  Normal,
  Big,
}

function getTextSize(size: Size) {
  switch (size) {
    case Size.Big:
      return "text-lg";

    case Size.Normal:
      return "text-base";

    case Size.Small:
      return "text-sm";
  }
}

export function AmountValueFormat({
  abs = false,
  currency,
  quantity,
  round = false,
}: {
  abs?: boolean;
  currency: Currency;
  quantity: number;
  round?: boolean;
}) {
  let displayAmount = quantity / 100;

  if (round) {
    displayAmount = Math.round(displayAmount);
  }

  if (abs) {
    displayAmount = Math.abs(displayAmount);
  }

  return new Intl.NumberFormat("en-GB", {
    currency: currency,
    maximumFractionDigits: round ? 0 : 2,
    style: "currency",
  }).format(displayAmount);
}

export default function AmountValue({
  abs,
  currency,
  quantity,
  round,
  size = Size.Normal,
}: {
  abs?: boolean;
  currency: Currency;
  quantity: number;
  round?: boolean;
  size?: Size;
}) {
  return (
    <span
      className={`${
        quantity > 0 ? "text-green-900" : "text-red-900"
      } text-mono whitespace-nowrap ${getTextSize(size)}`}
    >
      {AmountValueFormat({ abs, currency, quantity, round })}
    </span>
  );
}
