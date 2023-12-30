import { createContext } from "react";

export const TransactionsCategoriesContext = createContext<{
  refetchCategories: () => void;
}>({ refetchCategories: () => {} });
