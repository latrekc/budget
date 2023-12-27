import { Currency } from "./Transactions/cell/__generated__/TransactionAmountCell__transactio.graphql";

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

export default function AmountValue({
  amount,
  currency,
  round,
  abs,
  size = Size.Normal,
}: {
  amount: number;
  currency: Currency;
  round?: boolean;
  abs?: boolean;
  size?: Size;
}) {
  let displayAmount = amount;

  if (round) {
    displayAmount = Math.round(displayAmount);
  }

  if (abs) {
    displayAmount = Math.abs(displayAmount);
  }

  return (
    <span
      className={`${
        amount > 0 ? "text-green-900" : "text-red-900"
      } text-mono ${getTextSize(size)}`}
    >
      {new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: round ? 0 : 2,
      }).format(displayAmount)}
    </span>
  );
}