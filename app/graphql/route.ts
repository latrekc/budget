import type { NextApiRequest, NextApiResponse } from "next";

import { createYoga } from "graphql-yoga";

import { schema } from "./schema";

const { handleRequest } = createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  fetchAPI: { Response },
  graphqlEndpoint: "/graphql",
  schema,
});

export {
  handleRequest as GET,
  handleRequest as OPTIONS,
  handleRequest as POST,
};

export const config = {
  api: {
    bodyParser: false,
  },
};
