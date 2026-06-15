import Image from "next/image";
import { Source } from "./Transactions/cell/__generated__/TransactionSourceCell.graphql";

export default function SourceImage({ source }: { source: Source }) {
  const path = `/assets/sources/${source}.svg`;
  return (
    <span className="relative inline-block size-6 flex-none">
      <Image alt={source} className="object-contain" fill priority src={path} />
    </span>
  );
}
