import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useState } from "react";
import { TiPlus } from "react-icons/ti";
import { graphql, useFragment } from "react-relay";
import TransactionSetCategoryButton from "../../buttons/TransactionSetCategoryButton";
import { TransactionCellAddCategoryButton$key } from "./__generated__/TransactionCellAddCategoryButton.graphql";

export default function TransactionCellAddCategoryButton({
  transaction: transaction$key,
}: {
  transaction: TransactionCellAddCategoryButton$key;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { id, amount } = useFragment(
    graphql`
      fragment TransactionCellAddCategoryButton on Transaction {
        id
        amount
      }
    `,
    transaction$key,
  );

  return (
    <Popover
      showArrow
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger onClick={() => setIsOpen(true)}>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          title="Set category"
          className="p-0"
        >
          <TiPlus size="1em" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <TransactionSetCategoryButton
              transactions={[{ transaction: id, amount }]}
              onCompleted={() => setIsOpen(false)}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
