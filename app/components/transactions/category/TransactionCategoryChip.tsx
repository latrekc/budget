import chroma from "chroma-js";
import { graphql, useFragment } from "react-relay";
import { TransactionCategoryChip_category$key } from "./__generated__/TransactionCategoryChip_category.graphql";

export default function TransactionCategoryChip({
  category: category$key,
  onlyLeaf = false,
}: {
  category: TransactionCategoryChip_category$key;
  onlyLeaf?: boolean;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategoryChip_category on Category {
        name
        color

        parentCategory {
          name
          color

          parentCategory {
            name
            color
          }
        }
      }
    `,
    category$key,
  );

  if (category.parentCategory == null || onlyLeaf) {
    return <Chip name={category.name} color={category.color} />;
  } else if (category.parentCategory.parentCategory == null) {
    return (
      <Chip
        name={category.parentCategory.name}
        color={category.parentCategory.color}
      >
        <Chip name={category.name} color={category.color} />
      </Chip>
    );
  } else {
    return (
      <Chip
        name={category.parentCategory.parentCategory.name}
        color={category.parentCategory.parentCategory.color}
      >
        <Chip
          name={category.parentCategory.name}
          color={category.parentCategory.color}
        >
          <Chip name={category.name} color={category.color} />
        </Chip>
      </Chip>
    );
  }
}

function Chip({
  name,
  color,
  children,
}: {
  name: string | null;
  color?: string | null;
  children?: React.ReactNode;
}) {
  const luminance = chroma(color!).luminance();

  return (
    <div
      className="row box-border flex flex-row rounded-lg bg-default p-0 shadow-small"
      style={{
        backgroundColor: color!,
        color: luminance > 0.3 ? "black" : "white",
      }}
    >
      <span className="px-2 text-sm">{name}</span>
      {children}
    </div>
  );
}
