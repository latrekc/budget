import prisma from "../lib/prisma";

export const resolvers = {
  Query: {
    transactions: () => {
      return prisma.transaction.findMany();
    },
  },
};
