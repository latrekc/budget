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

  const { amount, id } = useFragment(
    graphql`
      fragment TransactionCellAddCategoryButton on Transaction {
        id @required(action: THROW)
        amount @required(action: THROW)
      }
    `,
    transaction$key,
  );

  return (
    <Popover
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
              onCompleted={() => setIsOpen(false)}
              transactions={[{ amount, transaction: id }]}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
