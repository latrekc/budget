import { Transaction } from "../../../../src/types";
import Image from "next/image";

export default function TransactionSourceCell({
  transaction: { source },
}: {
  transaction: Transaction;
}) {
  const path = `/assets/sources/${source}.svg`;
  return <Image priority src={path} height={24} width={24} alt={source} />;
}
