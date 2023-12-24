import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";
import { schema } from "./schema";

const { handleRequest } = createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: "/graphql",
  fetchAPI: { Response },
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
