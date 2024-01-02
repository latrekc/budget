import Image from "next/image";
import { Source } from "./Transactions/cell/__generated__/TransactionSourceCell__transaction.graphql";

export default function SourceImage({ source }: { source: Source }) {
  const path = `/assets/sources/${source}.svg`;
  return <Image priority src={path} height={24} width={24} alt={source} />;
}
