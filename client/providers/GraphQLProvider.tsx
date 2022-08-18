import { createContext, useContext } from "react";
import { GraphQLClient } from "graphql-request";
import { userLoggedInFetch } from "../lib/shopify/helpers.js";

const gqlClientContext = createContext(null);

export const GraphQLClientProvider = (props) => {
  const graphQLClient = new GraphQLClient("graphql", {
    credentials: "include",
    fetch: userLoggedInFetch(),
  });

  return <gqlClientContext.Provider value={graphQLClient} {...props} />;
};

export const useGraphQLClient = () => {
  const context = useContext(gqlClientContext);

  if (context === undefined) {
    throw new Error(`useGraphQLClient must be used within GraphQLProvider`);
  }

  return context;
};

export function GraphQLProvider({ children }) {
  return <GraphQLClientProvider>{children}</GraphQLClientProvider>;
}
