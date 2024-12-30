import { monthNames } from "@/lib/types";
import {
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useMemo } from "react";
import AmountValue, { Size } from "../AmountValue";
import CategoryChip2 from "../Categories/CategoryChip2";

export function DashboardTooltip({
  category,
  current,
  data,
  grandParentCategory,
  parentCategory,
}: {
  category: { color: string; name: string };
  current?: string;
  data: [string, null | number][];
  grandParentCategory: { color: string; name: string } | undefined;
  parentCategory: { color: string; name: string } | undefined;
}) {
  const rows = useMemo(
    () => [
      ...data
        .reduce<
          Map<string, { income: number; month: string; outcome: number }>
        >((all, [month, quantity]) => {
          if (!all.has(month)) {
            all.set(month, { income: 0, month, outcome: 0 });
          }
          const row = all.get(month)!;

          if (quantity != null) {
            if (quantity > 0) {
              row.income = quantity;
            }
            if (quantity < 0) {
              row.outcome = quantity;
            }
          }

          return all;
        }, new Map())
        .values(),
    ],
    [data],
  );

  const total = useMemo(
    () => data.reduce<number>((all, [_, quantity]) => all + (quantity ?? 0), 0),
    [data],
  );

  return (
    <>
      <div className="mb-4 flex shrink flex-row flex-wrap">
        <CategoryChip2
          categories={[category, parentCategory, grandParentCategory]}
          currency="GBP"
          quantity={total}
        />
      </div>
      <ScrollShadow className="max-h-[400px]">
        <Table
          removeWrapper
          selectedKeys={current ? [current] : []}
          selectionMode="single"
        >
          <TableHeader>
            <TableColumn>Name</TableColumn>
            <TableColumn className="text-right">Income</TableColumn>
            <TableColumn className="text-right">Outcome</TableColumn>
            <TableColumn className="text-right">Saldo</TableColumn>
          </TableHeader>
          <TableBody>
            {rows.map(({ income, month, outcome }) => (
              <TableRow key={month}>
                <TableCell>{formatMonth(month)}</TableCell>
                <TableCell className="text-right">
                  {income > 0 ? (
                    <AmountValue
                      currency="GBP"
                      quantity={income}
                      size={Size.Small}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {outcome < 0 ? (
                    <AmountValue
                      currency="GBP"
                      quantity={outcome}
                      size={Size.Small}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {income + outcome != 0 ? (
                    <AmountValue currency="GBP" quantity={income + outcome} />
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollShadow>
    </>
  );
}

function formatMonth(month: string) {
  const [yearNumber, monthNumber] = month.split("-");
  return `${monthNames.get(parseInt(monthNumber))} ${yearNumber}`;
}
