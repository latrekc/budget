import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useState } from "react";
import { TiPlus } from "react-icons/ti";
import { graphql, useFragment } from "react-relay";

import TransactionSetCategoryButton from "../../TransactionSetCategoryButton";
import { TransactionCellAddCategoryButton$key } from "./__generated__/TransactionCellAddCategoryButton.graphql";
import { TransactionCellAddCategoryButton_Categories$key } from "./__generated__/TransactionCellAddCategoryButton_Categories.graphql";

export default function TransactionCellAddCategoryButton({
  categories: categories$key,
  transaction: transaction$key,
}: {
  categories: TransactionCellAddCategoryButton_Categories$key;
  transaction: TransactionCellAddCategoryButton$key;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { id, quantity } = useFragment(
    graphql`
      fragment TransactionCellAddCategoryButton on Transaction {
        id @required(action: THROW)
        quantity @required(action: THROW)
      }
    `,
    transaction$key,
  );

  const categories = useFragment(
    graphql`
      fragment TransactionCellAddCategoryButton_Categories on Query {
        ...TransactionSetCategoryButton_Categories
      }
    `,
    categories$key,
  );

  return (
    <Popover
      autoFocus={false}
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      showArrow
    >
      <PopoverTrigger onClick={() => setIsOpen(true)}>
        <Button
          className="p-0"
          isIconOnly
          size="sm"
          title="Set category"
          variant="flat"
        >
          <TiPlus size="1em" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <TransactionSetCategoryButton
              categories={categories}
              onCompleted={() => setIsOpen(false)}
              transactions={[{ quantity, transaction: id }]}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
