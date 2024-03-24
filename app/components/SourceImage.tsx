import Image from "next/image";
import { Source } from "./Transactions/cell/__generated__/TransactionSourceCell.graphql";

export default function SourceImage({ source }: { source: Source }) {
  const path = `/assets/sources/${source}.svg`;
  return <Image alt={source} height={24} priority src={path} width={24} />;
}
