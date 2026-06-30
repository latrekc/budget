import { createYoga } from "graphql-yoga";

import { schema } from "./schema";

const { handleRequest } = createYoga({
  fetchAPI: { Response },
  graphqlEndpoint: "/graphql",
  schema,
});

function handler(request: Request) {
  return handleRequest(request, {});
}

export { handler as GET, handler as OPTIONS, handler as POST };
