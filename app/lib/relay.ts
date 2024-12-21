import {
  Environment,
  Network,
  Observable,
  RecordSource,
  RelayFeatureFlags,
  RelayFieldLogger,
  RequestParameters,
  Store,
  Variables,
} from "relay-runtime";
RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

const IS_SERVER = typeof window === typeof undefined;

/**
 * Custom fetch function to handle GraphQL requests for a Relay environment.
 *
 * This function is responsible for sending GraphQL requests over the network and returning
 * the response data. It can be customized to integrate with different network libraries or
 * to add authentication headers as needed.
 *
 * @param {RequestParameters} params - The GraphQL request parameters to send to the server.
 * @param {Variables} variables - Variables used in the GraphQL query.
 */
function fetchFunction(params: RequestParameters, variables: Variables) {
  const response = fetch("/graphql", {
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
    headers: [["Content-Type", "application/json"]],
    method: "POST",
  });

  return Observable.from(response.then((data) => data.json()));
}

function relayFieldLogger(event: Parameters<RelayFieldLogger>[0]) {
  if (event.kind === "relay_resolver.error") {
    // Log this somewhere!
    console.error(
      `Resolver error encountered in ${event.owner}.${event.fieldPath}`,
    );
    console.warn(event.error);
  }
}

/**
 * Creates a new Relay environment instance for managing (fetching, storing) GraphQL data.
 */
export function createEnvironment() {
  const network = Network.create(fetchFunction);
  const store = new Store(new RecordSource());
  return new Environment({
    isServer: IS_SERVER,
    network,
    relayFieldLogger,
    store,
  });
}

export const environment = createEnvironment();

export function getCurrentEnvironment() {
  if (IS_SERVER) {
    return createEnvironment();
  }

  return environment;
}
