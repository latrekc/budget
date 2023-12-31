import prisma, { parseId } from "../../lib/prisma";
import { builder } from "../builder";

builder.prismaObject("Category", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    parentCategory: t.relation("parentCategory", {
      nullable: true,
    }),
    subCategories: t.relation("subCategories", {
      query: () => ({
        orderBy: {
          name: "asc",
        },
      }),
    }),
  }),
});

builder.queryField("categories", (t) =>
  t.prismaField({
    type: ["Category"],
    resolve: (query) =>
      prisma.category.findMany({ ...query, orderBy: [{ name: "asc" }] }),
  }),
);

async function validateCategoryOrThrow({
  id,
  name,
  parentId,
}: {
  name: string;
  id?: number | null;
  parentId?: number | null;
}) {
  if (parentId != null) {
    const parentExists = await prisma.category.exists({
      id: parentId,
    });

    if (!parentExists) {
      throw new Error(`Parent category ${parentId} does not exist`);
    }
  }

  const params =
    id != null
      ? { parentCategoryId: parentId, name: name, id: { not: id } }
      : {
          parentCategoryId: parentId,
          name: name,
        };
  const categoryExist = await prisma.category.exists(params);

  if (categoryExist) {
    const parent =
      parentId != null
        ? await prisma.category.findFirst({
            where: {
              id: parentId,
            },
          })
        : null;

    throw new Error(
      `Another category ${name} alredy exists in ${
        parent != null ? parent.name : "a root category"
      }`,
    );
  }
}

builder.mutationType({
  fields: (t) => ({
    createCategory: t.prismaField({
      type: "Category",
      args: {
        name: t.arg.string({ required: true }),
        parent: t.arg.id(),
      },
      errors: {
        types: [Error],
      },
      resolve: async (query, _root, args) => {
        await validateCategoryOrThrow({
          name: args.name,
          parentId: parseId(args.parent),
        });

        const category = await prisma.category.create({
          ...query,
          data: {
            name: args.name,
            parentCategoryId: parseId(args.parent),
          },
        });

        return category;
      },
    }),
    updateCategory: t.prismaField({
      type: "Category",
      args: {
        id: t.arg.id({ required: true }),
        name: t.arg.string({ required: true }),
        parent: t.arg.id(),
      },
      errors: {
        types: [Error],
      },
      resolve: async (query, _root, args) => {
        await validateCategoryOrThrow({
          id: parseId(args.id),
          name: args.name,
          parentId: parseId(args.parent),
        });

        const category = await prisma.category.update({
          ...query,
          data: {
            name: args.name,
            parentCategoryId: parseId(args.parent),
          },
          where: {
            id: parseId(args.id)!,
          },
        });

        return category;
      },
    }),
    deleteCategory: t.prismaField({
      type: "Category",
      args: {
        id: t.arg.id({ required: true }),
      },
      errors: {
        types: [Error],
      },
      resolve: async (query, _root, args) => {
        const category = await prisma.category.findFirst({
          where: {
            id: parseId(args.id)!,
          },
        });

        if (category == null) {
          throw new Error(`Category ${args.id} does not exist`);
        }

        await prisma.category.delete({
          ...query,
          where: {
            id: parseId(args.id)!,
          },
        });

        return category;
      },
    }),
  }),
});
