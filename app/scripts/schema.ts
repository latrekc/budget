import { writeFileSync } from "fs";
import { lexicographicSortSchema, printSchema } from "graphql";
import { resolve as resolvePath } from "path";

import { schema } from "../graphql/schema";

const schemaAsString = printSchema(lexicographicSortSchema(schema));

writeFileSync(
  resolvePath(__dirname, "../graphql/schema.graphql"),
  schemaAsString,
);
