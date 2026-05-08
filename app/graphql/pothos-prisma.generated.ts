export const prismaDmmf = {
  "datamodel": {
    "enums": [],
    "models": [
      {
        "name": "Transaction",
        "dbName": "transactions",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": true,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "source",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "date",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "DateTime",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "description",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "amount",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "amount_converted",
            "kind": "scalar",
            "isList": false,
            "isRequired": false,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "currency",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "categories",
            "kind": "object",
            "isList": true,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "TransactionsOnCategories",
            "nativeType": null,
            "relationName": "TransactionToTransactionsOnCategories",
            "relationFromFields": [],
            "relationToFields": [],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "completed",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "Boolean",
            "nativeType": null,
            "default": false,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [],
        "uniqueIndexes": [],
        "isGenerated": false
      },
      {
        "name": "Category",
        "dbName": "categories",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": true,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "Int",
            "nativeType": null,
            "default": {
              "name": "autoincrement",
              "args": []
            },
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "name",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "parentCategory",
            "kind": "object",
            "isList": false,
            "isRequired": false,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Category",
            "nativeType": null,
            "relationName": "ParentCategory",
            "relationFromFields": [
              "parentCategoryId"
            ],
            "relationToFields": [
              "id"
            ],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "parentCategoryId",
            "kind": "scalar",
            "isList": false,
            "isRequired": false,
            "isUnique": false,
            "isId": false,
            "isReadOnly": true,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "subCategories",
            "kind": "object",
            "isList": true,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Category",
            "nativeType": null,
            "relationName": "ParentCategory",
            "relationFromFields": [],
            "relationToFields": [],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "transactions",
            "kind": "object",
            "isList": true,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "TransactionsOnCategories",
            "nativeType": null,
            "relationName": "CategoryToTransactionsOnCategories",
            "relationFromFields": [],
            "relationToFields": [],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "statistic",
            "kind": "object",
            "isList": true,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Statistic",
            "nativeType": null,
            "relationName": "CategoryToStatistic",
            "relationFromFields": [],
            "relationToFields": [],
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [
          [
            "name",
            "parentCategoryId"
          ]
        ],
        "uniqueIndexes": [
          {
            "name": null,
            "fields": [
              "name",
              "parentCategoryId"
            ]
          }
        ],
        "isGenerated": false
      },
      {
        "name": "CurrencyExchangeRate",
        "dbName": "currency_exchange_rates",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": true,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "date",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "DateTime",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "base",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "target",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "rate",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Float",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [
          [
            "date",
            "base",
            "target"
          ]
        ],
        "uniqueIndexes": [
          {
            "name": null,
            "fields": [
              "date",
              "base",
              "target"
            ]
          }
        ],
        "isGenerated": false
      },
      {
        "name": "TransactionsOnCategories",
        "dbName": "transactions2categories",
        "schema": null,
        "fields": [
          {
            "name": "transaction",
            "kind": "object",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Transaction",
            "nativeType": null,
            "relationName": "TransactionToTransactionsOnCategories",
            "relationFromFields": [
              "transactionId"
            ],
            "relationToFields": [
              "id"
            ],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "transactionId",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": true,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "category",
            "kind": "object",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Category",
            "nativeType": null,
            "relationName": "CategoryToTransactionsOnCategories",
            "relationFromFields": [
              "categoryId"
            ],
            "relationToFields": [
              "id"
            ],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "categoryId",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": true,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "amount",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "amount_converted",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": {
          "name": null,
          "fields": [
            "transactionId",
            "categoryId"
          ]
        },
        "uniqueFields": [],
        "uniqueIndexes": [],
        "isGenerated": false
      },
      {
        "name": "CurrencyExchangeRateClaim",
        "dbName": "currency_exchange_rate_clames",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "date",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "DateTime",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "currency",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [],
        "uniqueIndexes": [],
        "isGenerated": false
      },
      {
        "name": "StatisticPerMonths",
        "dbName": "transactions_statistic_per_months",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "year",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "month",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "income",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "outcome",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [],
        "uniqueIndexes": [],
        "isGenerated": false
      },
      {
        "name": "StatisticPerSource",
        "dbName": "transactions_statistic_per_source",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "income",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "outcome",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "source",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [],
        "uniqueIndexes": [],
        "isGenerated": false
      },
      {
        "name": "Statistic",
        "dbName": "transactions_statistic",
        "schema": null,
        "fields": [
          {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "monthId",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "income",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "outcome",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "category",
            "kind": "object",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "Category",
            "nativeType": null,
            "relationName": "CategoryToStatistic",
            "relationFromFields": [
              "categoryId"
            ],
            "relationToFields": [
              "id"
            ],
            "isGenerated": false,
            "isUpdatedAt": false
          },
          {
            "name": "categoryId",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": true,
            "hasDefaultValue": false,
            "type": "Int",
            "nativeType": null,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ],
        "primaryKey": null,
        "uniqueFields": [],
        "uniqueIndexes": [],
        "isGenerated": false
      }
    ],
    "types": [],
    "indexes": [
      {
        "model": "Transaction",
        "type": "id",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "Transaction",
        "type": "unique",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "Category",
        "type": "id",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "Category",
        "type": "unique",
        "isDefinedOnField": false,
        "fields": [
          {
            "name": "name"
          },
          {
            "name": "parentCategoryId"
          }
        ]
      },
      {
        "model": "CurrencyExchangeRate",
        "type": "id",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "CurrencyExchangeRate",
        "type": "unique",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "CurrencyExchangeRate",
        "type": "unique",
        "isDefinedOnField": false,
        "fields": [
          {
            "name": "date"
          },
          {
            "name": "base"
          },
          {
            "name": "target"
          }
        ]
      },
      {
        "model": "TransactionsOnCategories",
        "type": "id",
        "isDefinedOnField": false,
        "fields": [
          {
            "name": "transactionId"
          },
          {
            "name": "categoryId"
          }
        ]
      },
      {
        "model": "CurrencyExchangeRateClaim",
        "type": "unique",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "StatisticPerMonths",
        "type": "unique",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "StatisticPerSource",
        "type": "unique",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      },
      {
        "model": "Statistic",
        "type": "unique",
        "isDefinedOnField": true,
        "fields": [
          {
            "name": "id"
          }
        ]
      }
    ]
  }
};