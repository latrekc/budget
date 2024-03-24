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

export default function AmountValue({
  abs,
  amount,
  currency,
  round,
  size = Size.Normal,
}: {
  abs?: boolean;
  amount: number;
  currency: Currency;
  round?: boolean;
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
      } text-mono whitespace-nowrap ${getTextSize(size)}`}
    >
      {new Intl.NumberFormat("en-GB", {
        currency: currency,
        maximumFractionDigits: round ? 0 : 2,
        style: "currency",
      }).format(displayAmount)}
    </span>
  );
}
