"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Transaction } from "@app/types";
import { useCallback, useMemo } from "react";
import TransactionDateCell from "./cell/date";
import TransactionDescriptionCell from "./cell/description";
import TransactionAmountCell from "./cell/amount";
import TransactionSourceCell from "./cell/source";

enum Colunms {
  "Source" = "Source",
  "Date" = "Date",
  "Description" = "Description",
  "Amount" = "Amount",
}

export default function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const columns = useMemo(
    () =>
      Object.values(Colunms).map((column) => ({
        key: column,
        label: column,
      })),
    [],
  );

  const renderCell = useCallback(
    (transaction: Transaction, columnKey: Colunms) => {
      switch (columnKey) {
        case Colunms.Date:
          return <TransactionDateCell transaction={transaction} />;

        case Colunms.Description:
          return <TransactionDescriptionCell transaction={transaction} />;

        case Colunms.Amount:
          return <TransactionAmountCell transaction={transaction} />;

        case Colunms.Source:
          return <TransactionSourceCell transaction={transaction} />;
      }
    },
    [],
  );

  const cellAlign = useCallback((columnKey: Colunms) => {
    switch (columnKey) {
      case Colunms.Date:
        return "text-center";

      case Colunms.Description:
        return "text-left";

      case Colunms.Amount:
        return "text-right";

      case Colunms.Source:
        return "flex justify-center items-center";
    }
  }, []);

  return (
    <Table
      aria-label="Example empty table"
      radius="none"
      shadow="none"
      isHeaderSticky
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            className={cellAlign(column.key as Colunms)}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody items={transactions}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell className={cellAlign(columnKey as Colunms)}>
                {renderCell(item, columnKey as Colunms)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
