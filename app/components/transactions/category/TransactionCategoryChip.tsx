import AmountValue, { Size } from "@/components/AmountValue";
import { useButton } from "@nextui-org/react";
import chroma from "chroma-js";
import { useRef, useState } from "react";
import { TiDelete } from "react-icons/ti";
import { graphql, useFragment } from "react-relay";

import { Currency } from "../cell/__generated__/TransactionAmountCell__transactio.graphql";
import { TransactionCategoryChip$key } from "./__generated__/TransactionCategoryChip.graphql";

export default function TransactionCategoryChip({
  amount,
  category: category$key,
  currency,
  isDisabledDelete = false,
  onDelete,
  onlyLeaf = false,
}: {
  amount?: null | number;
  category: TransactionCategoryChip$key;
  currency?: Currency;
  isDisabledDelete?: boolean;
  onDelete?: () => void;
  onlyLeaf?: boolean;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategoryChip on Category {
        name @required(action: THROW)
        color

        parentCategory {
          name @required(action: THROW)
          color

          parentCategory {
            name @required(action: THROW)
            color
          }
        }
      }
    `,
    category$key,
  );

  const button =
    onDelete != null ? (
      <DeleteButton isDisabled={isDisabledDelete} onDelete={onDelete} />
    ) : null;

  if (category.parentCategory == null || onlyLeaf) {
    return (
      <Chip
        amount={amount}
        button={button}
        color={category.color}
        currency={currency}
        name={category.name}
      />
    );
  } else if (category.parentCategory.parentCategory == null) {
    return (
      <Chip
        color={category.parentCategory.color}
        name={category.parentCategory.name}
      >
        <Chip
          amount={amount}
          button={button}
          color={category.color}
          currency={currency}
          name={category.name}
        />
      </Chip>
    );
  } else {
    return (
      <Chip
        color={category.parentCategory.parentCategory.color}
        name={category.parentCategory.parentCategory.name}
      >
        <Chip
          color={category.parentCategory.color}
          name={category.parentCategory.name}
        >
          <Chip
            amount={amount}
            button={button}
            color={category.color}
            currency={currency}
            name={category.name}
          />
        </Chip>
      </Chip>
    );
  }
}

function Chip({
  amount,
  button,
  children,
  color,
  currency,
  name,
}: {
  amount?: null | number;
  button?: React.ReactNode;
  children?: React.ReactNode;
  color?: null | string;
  currency?: Currency;
  name: null | string;
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

function DeleteButton({
  isDisabled = false,
  onDelete,
}: {
  isDisabled?: boolean;
  onDelete: () => void;
}) {
  const ref = useRef(null);

  const { getButtonProps } = useButton({
    onClick: onDelete,
    ref,
  });

  const [isHover, setIsHover] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      ref={ref}
      {...getButtonProps()}
      className="p-0 px-1"
      disabled={isDisabled}
      title="Remove category"
    >
      <TiDelete color={isHover ? "#ccc" : "white"} size="1.2em" />
    </button>
  );
}
