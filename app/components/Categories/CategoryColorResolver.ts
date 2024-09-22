import chroma from "chroma-js";
import { graphql } from "relay-runtime";
import { readFragment } from "relay-runtime/lib/store/ResolverFragments";

import { environment } from "../../lib/relay";
import { CategoryColorResolver$key } from "./__generated__/CategoryColorResolver.graphql";

type CategoryRecord = {
  id: string;
  parentCategory: {
    __ref: string;
  } | null;
} | null;

// https://github.com/gka/chroma.js/blob/main/src/colors/colorbrewer.js
const ROOT_SCALE = "RdYlGn";

const COLORS_CACHE = new Map<string, string>();

/**
 * @RelayResolver Category.color: String
 * @rootFragment CategoryColorResolver
 *
 * A color for the category
 */
export function color(categoryKey: CategoryColorResolver$key): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const category = readFragment(
    graphql`
      fragment CategoryColorResolver on Category {
        id @required(action: THROW)
        parentCategory {
          id @required(action: THROW)
        }
      }
    `,
    categoryKey,
  );

  const source = environment.getStore().getSource();
  const root = source.get("client:root")!;
  const rootCategoriesKey = Object.keys(root).find((k) =>
    k.startsWith("categories"),
  )!;

  const allCategories = (
    root[rootCategoriesKey] as {
      __refs: [string];
    }
  ).__refs.map((categoryId) => source.get(categoryId) as CategoryRecord);

  const filterByParent = (parentId: null | string | undefined) => {
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
    const key = JSON.stringify([parentColors, categories, categoryId]);

    if (!COLORS_CACHE.has(key)) {
      const index = categories.findIndex((data) => data?.id === categoryId);
      COLORS_CACHE.set(key, parentColors.at(index)!);
    }

    return COLORS_CACHE.get(key)!;
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
