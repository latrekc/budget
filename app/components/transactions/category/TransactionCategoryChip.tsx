import AmountValue, { Size } from "@/components/AmountValue";
import chroma from "chroma-js";
import { graphql, useFragment } from "react-relay";
import { Currency } from "../cell/__generated__/TransactionAmountCell__transactio.graphql";
import { TransactionCategoryChip$key } from "./__generated__/TransactionCategoryChip.graphql";

export default function TransactionCategoryChip({
  category: category$key,
  onlyLeaf = false,
  amount,
  currency,
  button,
}: {
  category: TransactionCategoryChip$key;
  onlyLeaf?: boolean;
  amount?: number | null;
  currency?: Currency;
  button?: React.ReactNode;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategoryChip on Category {
        name
        color

        parentCategory {
          name
          color

          parentCategory {
            name
            color
          }
        }
      }
    `,
    category$key,
  );

  if (category.parentCategory == null || onlyLeaf) {
    return (
      <Chip
        name={category.name}
        color={category.color}
        amount={amount}
        currency={currency}
        button={button}
      />
    );
  } else if (category.parentCategory.parentCategory == null) {
    return (
      <Chip
        name={category.parentCategory.name}
        color={category.parentCategory.color}
      >
        <Chip
          name={category.name}
          color={category.color}
          amount={amount}
          currency={currency}
          button={button}
        />
      </Chip>
    );
  } else {
    return (
      <Chip
        name={category.parentCategory.parentCategory.name}
        color={category.parentCategory.parentCategory.color}
      >
        <Chip
          name={category.parentCategory.name}
          color={category.parentCategory.color}
        >
          <Chip
            name={category.name}
            color={category.color}
            amount={amount}
            currency={currency}
            button={button}
          />
        </Chip>
      </Chip>
    );
  }
}

function Chip({
  name,
  color,
  children,
  amount,
  currency,
  button,
}: {
  name: string | null;
  color?: string | null;
  children?: React.ReactNode;
  amount?: number | null;
  currency?: Currency;
  button?: React.ReactNode;
}) {
  const luminance = chroma(color!).luminance();

  return (
    <div
      className="box-border flex grow-0 flex-row rounded-lg bg-default p-0 shadow-small"
      style={{
        backgroundColor: color!,
        color: luminance > 0.3 ? "black" : "white",
      }}
    >
      <span className="whitespace-nowrap px-2 text-sm">{name}</span>
      {amount != null && currency != null ? (
        <div className="rounded-lg bg-white px-2">
          <AmountValue amount={amount} currency={currency} size={Size.Small} />
        </div>
      ) : null}
      {button}
      {children}
    </div>
  );
}
