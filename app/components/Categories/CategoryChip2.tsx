import AmountValue, { Size } from "@/components/AmountValue";
import { useButton } from "@nextui-org/react";
import chroma from "chroma-js";
import { useRef } from "react";

import { BiHide } from "react-icons/bi";
import { TiDelete } from "react-icons/ti";
import { Currency } from "../Transactions/cell/__generated__/TransactionAmountCell.graphql";

export default function CategoryChip2({
  amount,
  categories,
  currency,
  ignore = false,
  isDisabledDelete = false,
  onDelete,
  onlyLeaf = false,
}: {
  amount?: null | number;
  categories: ({ color: string; name: string } | null | undefined)[];
  currency?: Currency;
  ignore?: boolean;
  isDisabledDelete?: boolean;
  onDelete?: () => void;
  onlyLeaf?: boolean;
}) {
  const button =
    onDelete != null ? (
      <DeleteButton isDisabled={isDisabledDelete} onDelete={onDelete} />
    ) : null;

  const [category, parentCategory, grandParentCategory] = categories;

  if (category == null) {
    return null;
  }

  if (parentCategory == null || onlyLeaf) {
    return (
      <Chip
        amount={amount}
        button={button}
        color={category.color}
        currency={currency}
        ignore={ignore}
        name={category.name}
      />
    );
  } else if (grandParentCategory == null) {
    return (
      <Chip
        color={parentCategory.color}
        ignore={ignore}
        name={parentCategory.name}
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
        color={grandParentCategory.color}
        ignore={ignore}
        name={grandParentCategory.name}
      >
        <Chip color={parentCategory.color} name={parentCategory.name}>
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
  ignore,
  name,
}: {
  amount?: null | number;
  button?: React.ReactNode;
  children?: React.ReactNode;
  color?: null | string;
  currency?: Currency;
  ignore?: boolean;
  name: null | string;
}) {
  const luminance = chroma(color!).luminance();

  return (
    <div
      className={`box-border flex h-7 grow-0 flex-row items-center justify-between rounded-full bg-default p-0 px-1 ${
        children != null || button != null ? "pr-0" : "pr-1"
      }`}
      style={{
        backgroundColor: color!,
        color: luminance > 0.3 ? "black" : "white",
      }}
    >
      {ignore && (
        <span className="ml-2">
          <BiHide />
        </span>
      )}
      <span className="whitespace-nowrap px-2 text-small">{name}</span>
      {amount != null && currency != null ? (
        <div className="rounded-full bg-white px-2">
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

  return (
    <button
      ref={ref}
      {...getButtonProps()}
      className="p-0 pr-2 opacity-70 transition-opacity hover:opacity-100"
      disabled={isDisabled}
      title="Remove category"
    >
      <TiDelete color="white" size="1.4em" />
    </button>
  );
}
