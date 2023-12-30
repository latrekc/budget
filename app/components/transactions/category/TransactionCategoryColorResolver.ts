import chroma from "chroma-js";
import { graphql } from "relay-runtime";
import { readFragment } from "relay-runtime/lib/store/ResolverFragments";
import { environment } from "../../../lib/relay";
import { TransactionCategoryColorResolver$key } from "./__generated__/TransactionCategoryColorResolver.graphql";

type CategoryRecord = {
  id: string;
  parentCategory: {
    __ref: string;
  } | null;
} | null;

// https://github.com/gka/chroma.js/blob/main/src/colors/colorbrewer.js
const ROOT_SCALE = "RdYlGn";

/**
 * @RelayResolver Category.color: String
 * @rootFragment TransactionCategoryColorResolver
 *
 * A color for the category
 */
export function color(
  categoryKey: TransactionCategoryColorResolver$key,
): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const category = readFragment(
    graphql`
      fragment TransactionCategoryColorResolver on Category {
        id
        parentCategory {
          id
        }
      }
    `,
    categoryKey,
  );

  const source = environment.getStore().getSource();
  const allCategories = (
    source.get("client:root")!.categories as {
      __refs: [string];
    }
  ).__refs.map((categoryId) => source.get(categoryId) as CategoryRecord);

  const filterByParent = (parentId: string | null | undefined) => {
    return allCategories.filter((data) =>
      parentId == null
        ? data?.parentCategory == null
        : data?.parentCategory != null &&
          data?.parentCategory.__ref === parentId,
    );
  };

  const getColorsByParentColors = (
    parentColors: string[],
    categories: CategoryRecord[],
    categoryId: string,
  ) => {
    const index = categories.findIndex((data) => data?.id === categoryId);
    return parentColors.at(index)!;
  };

  const rootCategories = filterByParent(null);
  const rootColors = chroma.scale(ROOT_SCALE).colors(rootCategories.length);

  if (category.parentCategory == null) {
    return getColorsByParentColors(rootColors, rootCategories, category.id)!;
  } else {
    // debugger;
    const parentCategory = allCategories.find(
      (data) => data?.id === category?.parentCategory?.id,
    )!;

    if (parentCategory?.parentCategory == null) {
      const parentColor = getColorsByParentColors(
        rootColors,
        rootCategories,
        parentCategory.id,
      );

      const darkenColor = chroma(parentColor).desaturate(3).darken(3);

      const parentCategories = filterByParent(parentCategory?.id);
      const parentScaleColors = chroma
        .scale([parentColor, darkenColor])
        .colors(parentCategories.length + 1)
        .slice(1);

      return getColorsByParentColors(
        parentScaleColors,
        parentCategories,
        category.id,
      )!;
    } else {
      const grandParentColor = getColorsByParentColors(
        rootColors,
        rootCategories,
        parentCategory.parentCategory.__ref,
      );

      const darkenGrandColor = chroma(grandParentColor).desaturate(3).darken(3);

      const grandParentCategories = filterByParent(
        parentCategory.parentCategory.__ref,
      );
      const grandParentScaleColors = chroma
        .scale([grandParentColor, darkenGrandColor])
        .colors(grandParentCategories.length + 1)
        .slice(1);

      const parentColor = getColorsByParentColors(
        grandParentScaleColors,
        grandParentCategories,
        parentCategory.id,
      )!;

      const darkenColor = chroma(parentColor).saturate(3).brighten(3);
      const parentCategories = filterByParent(parentCategory?.id);
      const parentScaleColors = chroma
        .scale([parentColor, darkenColor])
        .colors(parentCategories.length + 1)
        .slice(1);

      return getColorsByParentColors(
        parentScaleColors,
        parentCategories,
        category.id,
      )!;
    }
  }
}
