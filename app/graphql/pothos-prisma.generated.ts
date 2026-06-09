/* eslint-disable */
import type { Prisma, Transaction, Category, CurrencyExchangeRate, TransactionsOnCategories, CurrencyExchangeRateClaim, StatisticPerMonths, StatisticPerSource, Statistic } from "./prisma/index.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    Transaction: {
        Name: "Transaction";
        Shape: Transaction;
        Include: Prisma.TransactionInclude;
        Select: Prisma.TransactionSelect;
        OrderBy: Prisma.TransactionOrderByWithRelationInput;
        WhereUnique: Prisma.TransactionWhereUniqueInput;
        Where: Prisma.TransactionWhereInput;
        Create: Prisma.TransactionCreateInput;
        Update: Prisma.TransactionUpdateInput;
        RelationName: "categories";
        ListRelations: "categories";
        Relations: {
            categories: {
                Shape: TransactionsOnCategories[];
                Name: "TransactionsOnCategories";
                Nullable: false;
            };
        };
    };
    Category: {
        Name: "Category";
        Shape: Category;
        Include: Prisma.CategoryInclude;
        Select: Prisma.CategorySelect;
        OrderBy: Prisma.CategoryOrderByWithRelationInput;
        WhereUnique: Prisma.CategoryWhereUniqueInput;
        Where: Prisma.CategoryWhereInput;
        Create: Prisma.CategoryCreateInput;
        Update: Prisma.CategoryUpdateInput;
        RelationName: "parentCategory" | "subCategories" | "transactions" | "statistic";
        ListRelations: "subCategories" | "transactions" | "statistic";
        Relations: {
            parentCategory: {
                Shape: Category | null;
                Name: "Category";
                Nullable: true;
            };
            subCategories: {
                Shape: Category[];
                Name: "Category";
                Nullable: false;
            };
            transactions: {
                Shape: TransactionsOnCategories[];
                Name: "TransactionsOnCategories";
                Nullable: false;
            };
            statistic: {
                Shape: Statistic[];
                Name: "Statistic";
                Nullable: false;
            };
        };
    };
    CurrencyExchangeRate: {
        Name: "CurrencyExchangeRate";
        Shape: CurrencyExchangeRate;
        Include: never;
        Select: Prisma.CurrencyExchangeRateSelect;
        OrderBy: Prisma.CurrencyExchangeRateOrderByWithRelationInput;
        WhereUnique: Prisma.CurrencyExchangeRateWhereUniqueInput;
        Where: Prisma.CurrencyExchangeRateWhereInput;
        Create: Prisma.CurrencyExchangeRateCreateInput;
        Update: Prisma.CurrencyExchangeRateUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    TransactionsOnCategories: {
        Name: "TransactionsOnCategories";
        Shape: TransactionsOnCategories;
        Include: Prisma.TransactionsOnCategoriesInclude;
        Select: Prisma.TransactionsOnCategoriesSelect;
        OrderBy: Prisma.TransactionsOnCategoriesOrderByWithRelationInput;
        WhereUnique: Prisma.TransactionsOnCategoriesWhereUniqueInput;
        Where: Prisma.TransactionsOnCategoriesWhereInput;
        Create: Prisma.TransactionsOnCategoriesCreateInput;
        Update: Prisma.TransactionsOnCategoriesUpdateInput;
        RelationName: "transaction" | "category";
        ListRelations: never;
        Relations: {
            transaction: {
                Shape: Transaction;
                Name: "Transaction";
                Nullable: false;
            };
            category: {
                Shape: Category;
                Name: "Category";
                Nullable: false;
            };
        };
    };
    CurrencyExchangeRateClaim: {
        Name: "CurrencyExchangeRateClaim";
        Shape: CurrencyExchangeRateClaim;
        Include: never;
        Select: Prisma.CurrencyExchangeRateClaimSelect;
        OrderBy: Prisma.CurrencyExchangeRateClaimOrderByWithRelationInput;
        WhereUnique: Prisma.CurrencyExchangeRateClaimWhereUniqueInput;
        Where: Prisma.CurrencyExchangeRateClaimWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    StatisticPerMonths: {
        Name: "StatisticPerMonths";
        Shape: StatisticPerMonths;
        Include: never;
        Select: Prisma.StatisticPerMonthsSelect;
        OrderBy: Prisma.StatisticPerMonthsOrderByWithRelationInput;
        WhereUnique: Prisma.StatisticPerMonthsWhereUniqueInput;
        Where: Prisma.StatisticPerMonthsWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    StatisticPerSource: {
        Name: "StatisticPerSource";
        Shape: StatisticPerSource;
        Include: never;
        Select: Prisma.StatisticPerSourceSelect;
        OrderBy: Prisma.StatisticPerSourceOrderByWithRelationInput;
        WhereUnique: Prisma.StatisticPerSourceWhereUniqueInput;
        Where: Prisma.StatisticPerSourceWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Statistic: {
        Name: "Statistic";
        Shape: Statistic;
        Include: Prisma.StatisticInclude;
        Select: Prisma.StatisticSelect;
        OrderBy: Prisma.StatisticOrderByWithRelationInput;
        WhereUnique: Prisma.StatisticWhereUniqueInput;
        Where: Prisma.StatisticWhereInput;
        Create: {};
        Update: {};
        RelationName: "category";
        ListRelations: never;
        Relations: {
            category: {
                Shape: Category;
                Name: "Category";
                Nullable: false;
            };
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"Transaction\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"source\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"amount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"amount_converted\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currency\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TransactionsOnCategories\",\"kind\":\"object\",\"name\":\"categories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransactionToTransactionsOnCategories\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"completed\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Category\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Category\",\"kind\":\"object\",\"name\":\"parentCategory\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentCategory\",\"relationFromFields\":[\"parentCategoryId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"parentCategoryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Category\",\"kind\":\"object\",\"name\":\"subCategories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentCategory\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TransactionsOnCategories\",\"kind\":\"object\",\"name\":\"transactions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CategoryToTransactionsOnCategories\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Statistic\",\"kind\":\"object\",\"name\":\"statistic\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CategoryToStatistic\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"name\",\"parentCategoryId\"]}]},\"CurrencyExchangeRate\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"base\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"target\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"rate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"date\",\"base\",\"target\"]}]},\"TransactionsOnCategories\":{\"fields\":[{\"type\":\"Transaction\",\"kind\":\"object\",\"name\":\"transaction\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransactionToTransactionsOnCategories\",\"relationFromFields\":[\"transactionId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"transactionId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Category\",\"kind\":\"object\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CategoryToTransactionsOnCategories\",\"relationFromFields\":[\"categoryId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"categoryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"amount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"amount_converted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"transactionId\",\"categoryId\"]},\"uniqueIndexes\":[]},\"CurrencyExchangeRateClaim\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currency\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"StatisticPerMonths\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"year\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"month\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"income\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"outcome\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"StatisticPerSource\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"income\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"outcome\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"source\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Statistic\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"monthId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"income\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"outcome\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Category\",\"kind\":\"object\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CategoryToStatistic\",\"relationFromFields\":[\"categoryId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"categoryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }