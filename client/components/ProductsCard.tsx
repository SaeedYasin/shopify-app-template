import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Button,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useGraphQLClient } from "../providers/GraphQLProvider";
import { gql } from "graphql-request";

import { userLoggedInFetch } from "../lib/shopify/helpers.js";

const PRODUCTS_QUERY = gql`
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        title
      }
    }
  }
`;

function useProductCount() {
  const fetch = userLoggedInFetch();
  return useQuery(["api", "products", "count"], async () => {
    const { count } = await fetch("/api/products/count").then((res) =>
      res.json()
    );
    return count as number;
  });
}

function useProductCreate(noOfProducts = 2, showToast: () => void) {
  const queryClient = useQueryClient();
  const gqlClient = useGraphQLClient();
  return useMutation(
    ["api", "product"],
    async () => {
      await Promise.all(
        Array.from({ length: noOfProducts }).map(() =>
          gqlClient.request(PRODUCTS_QUERY, {
            input: {
              title: randomTitle(),
            },
          })
        )
      );
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries(["api", "products", "count"]);
        const previousCount: number = +queryClient.getQueryData([
          "api",
          "products",
          "count",
        ]);
        queryClient.setQueryData(
          ["api", "products", "count"],
          () => previousCount + 2
        );
        return { previousCount };
      },
      onError: (error, newCount, context) => {
        queryClient.setQueryData(
          ["api", "products", "count"],
          context.previousCount
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["api", "products", "count"]);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(["api", "products", "count"]);
        showToast();
      },
    }
  );
}

export function ProductsCard() {
  const [hasResults, setHasResults] = useState(false);
  const showToast = () => setHasResults(true);
  const { mutate } = useProductCreate(2, showToast);
  const { data: count, isLoading, error } = useProductCount();

  const toastMarkup = hasResults && (
    <Toast
      content="2 products created!"
      onDismiss={() => setHasResults(false)}
    />
  );

  return (
    <>
      {toastMarkup}
      <Card title="Product Counter" sectioned>
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">
                {isLoading && ".."}
                {error && "??"}
                {!isLoading && count}
              </TextStyle>
            </DisplayText>
          </Heading>
          <Button outline loading={isLoading} onClick={mutate}>
            Populate 2 products
          </Button>
        </TextContainer>
      </Card>
    </>
  );
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

  return `${adjective} ${noun}`;
}

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
  "late",
  "lingering",
  "bold",
  "little",
  "morning",
  "muddy",
  "old",
  "red",
  "rough",
  "still",
  "small",
  "sparkling",
  "throbbing",
  "shy",
  "wandering",
  "withered",
  "wild",
  "black",
  "young",
  "holy",
  "solitary",
  "fragrant",
  "aged",
  "snowy",
  "proud",
  "floral",
  "restless",
  "divine",
  "polished",
  "ancient",
  "purple",
  "lively",
  "nameless",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
  "firefly",
  "feather",
  "grass",
  "haze",
  "mountain",
  "night",
  "pond",
  "darkness",
  "snowflake",
  "silence",
  "sound",
  "sky",
  "shape",
  "surf",
  "thunder",
  "violet",
  "water",
  "wildflower",
  "wave",
  "water",
  "resonance",
  "sun",
  "wood",
  "dream",
  "cherry",
  "tree",
  "fog",
  "frost",
  "voice",
  "paper",
  "frog",
  "smoke",
  "star",
];
