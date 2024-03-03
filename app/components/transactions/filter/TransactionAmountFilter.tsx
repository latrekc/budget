import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection,
} from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "usehooks-ts";

import { FaEquals, FaGreaterThan, FaLessThan } from "react-icons/fa";

import { AmountRelation, enumFromStringValue } from "@/lib/types";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionAmountFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const [amountValue, setAmountValue] = useState<string>(filters.amount ?? "");
  const debouncedAmount = useDebounce<string>(amountValue, 500);

  const onSearch = useCallback((amount: string) => setAmountValue(amount), []);

  useEffect(() => {
    dispatch({
      payload:
        debouncedAmount.trim().length > 0 ? debouncedAmount.trim() : null,
      type: ReducerActionType.setAmount,
    });
  }, [debouncedAmount, dispatch]);

  const icons = useMemo(
    () => ({
      [AmountRelation.EQUAL]: <FaEquals />,
      [AmountRelation.GREATER]: <FaGreaterThan />,
      [AmountRelation.LESS]: <FaLessThan />,
    }),
    [],
  );

  const relations = Object.entries(AmountRelation).map(([id, label]) => (
    <DropdownItem key={id} value={id}>
      <div className="flex items-center gap-6">
        {icons[label]} {label}
      </div>
    </DropdownItem>
  ));

  const onAmountRelationChange = useCallback(
    (relation: Selection) => {
      let value = AmountRelation.EQUAL;

      if (relation instanceof Set) {
        value = enumFromStringValue<AmountRelation>(
          AmountRelation,
          [...relation.values()][0].toString() ?? AmountRelation.EQUAL,
        );
      }

      dispatch({
        payload: value,
        type: ReducerActionType.setAmountRelation,
      });
    },
    [dispatch],
  );

  return (
    <Input
      className="w-auto"
      isClearable
      label="Search by amount"
      labelPlacement="outside"
      onValueChange={onSearch}
      startContent={
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              {icons[filters.amountRelation ?? AmountRelation.EQUAL]}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            onSelectionChange={onAmountRelationChange}
            selectedKeys={[filters.amountRelation ?? AmountRelation.EQUAL]}
            selectionMode="single"
          >
            {relations}
          </DropdownMenu>
        </Dropdown>
      }
      type="number"
      value={amountValue}
    />
  );
}
