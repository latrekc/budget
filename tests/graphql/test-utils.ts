import { ExecutionResult, graphql, GraphQLSchema } from "graphql";

export async function executeGraphQL(
  schema: GraphQLSchema,
  source: string,
  variableValues?: Record<string, unknown>,
): Promise<ExecutionResult> {
  return graphql({
    schema,
    source,
    contextValue: {},
    variableValues,
  });
}
