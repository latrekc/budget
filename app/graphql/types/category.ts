import prisma from "../../lib/prisma";
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
        parent: t.arg.int(),
      },
      resolve: async (query, _root, args) => {
        await validateCategoryOrThrow({
          name: args.name,
          parentId: args.parent,
        });

        const category = await prisma.category.create({
          ...query,
          data: {
            name: args.name,
            parentCategoryId: args.parent,
          },
        });

        return category;
      },
    }),
    updateCategory: t.prismaField({
      type: "Category",
      args: {
        id: t.arg.int({ required: true }),
        name: t.arg.string({ required: true }),
        parent: t.arg.int(),
      },
      resolve: async (query, _root, args) => {
        await validateCategoryOrThrow({
          id: args.id,
          name: args.name,
          parentId: args.parent,
        });

        const category = await prisma.category.update({
          ...query,
          data: {
            name: args.name,
            parentCategoryId: args.parent,
          },
          where: {
            id: args.id,
          },
        });

        return category;
      },
    }),
  }),
});
