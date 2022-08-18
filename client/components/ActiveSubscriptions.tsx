import { useState } from "react";
import { Card, DataTable, ButtonGroup, Button } from "@shopify/polaris";
import { Redirect } from "@shopify/app-bridge/actions";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { userLoggedInFetch } from "../lib/shopify/helpers.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLClient } from "../providers/GraphQLProvider";
import { gql } from "graphql-request";

const GET_ACTIVE_SUBSCRIPTION = gql`
  {
    appInstallation {
      activeSubscriptions {
        name
        status
        lineItems {
          plan {
            pricingDetails {
              ... on AppRecurringPricing {
                __typename
                price {
                  amount
                  currencyCode
                }
                interval
              }
            }
          }
        }
        trialDays
        test
      }
    }
  }
`;

function generateRows(subscriptionData: {
  appInstallation: { activeSubscriptions: any[] };
}) {
  const activeSubscriptions =
    subscriptionData.appInstallation.activeSubscriptions;
  if (activeSubscriptions.length === 0) {
    return [["No Plan", "N/A", "N/A", "N/A", "USD 0.00"]];
  } else {
    return Object.entries(activeSubscriptions).map(([key, value]) => {
      const { name, status, test, trialDays } = value as any;
      const { amount, currencyCode } = (value as any).lineItems[0].plan
        .pricingDetails.price;
      return [
        name,
        status,
        `${test}`,
        `${trialDays}`,
        `${currencyCode} ${amount}`,
      ];
    });
  }
}

function useGetSubscription() {
  const gqlClient = useGraphQLClient();
  return useQuery(["api", "subscription"], async () => {
    const data = await gqlClient.request(GET_ACTIVE_SUBSCRIPTION);
    return generateRows(data);
  });
}

type ToastFn = React.Dispatch<
  React.SetStateAction<{
    toast: {
      msg: string;
      show: boolean;
    };
  }>
>;

function useDoSubscribe(showToast: ToastFn) {
  const fetch = userLoggedInFetch();
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  return useMutation(
    ["api", "billing"],
    async () => {
      const { url } = await fetch("/api/billing", {
        method: "POST",
      }).then((res) => res.json());
      redirect.dispatch(Redirect.Action.REMOTE, url);
    },
    {
      onError: () => {
        showToast({
          toast: { msg: "Error updating billing plan!", show: true },
        });
      },
    }
  );
}

function useDoUnsubscribe(showToast: ToastFn) {
  const queryClient = useQueryClient();
  const fetch = userLoggedInFetch();
  return useMutation(
    ["api", "billing"],
    async () => {
      await fetch("/api/billing", {
        method: "DELETE",
      }).then((res) => res.json());
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["api", "subscription"]);
        showToast({ toast: { msg: "Billing Plan Updated!", show: true } });
      },
      onError: () => {
        showToast({
          toast: { msg: "Error updating billing plan!", show: true },
        });
      },
    }
  );
}

export function ActiveSubscriptions() {
  const subscription = useGetSubscription();
  const [{ toast }, setToast] = useState({ toast: { msg: "", show: false } });
  const { mutate: unsubscribe } = useDoUnsubscribe(setToast);
  const { mutate: subscribe } = useDoSubscribe(setToast);

  const toastMarkup = toast.show && (
    <Toast
      content={toast.msg}
      onDismiss={() => setToast({ toast: { msg: "", show: false } })}
    />
  );

  return (
    <>
      {toastMarkup}
      <Card title="Active Subscriptions" sectioned>
        <Card.Section>
          <div className="flex flex-col md:flex-row items-center justify-items-center gap-4">
            <div>Your active subscription is shown below,</div>
            <div>
              <ButtonGroup>
                <Button
                  primary
                  loading={subscription.isLoading}
                  onClick={subscribe}
                >
                  Upgrade Plan
                </Button>
                <Button
                  outline
                  loading={subscription.isLoading}
                  onClick={unsubscribe}
                >
                  Downgrade Plan
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Card.Section>
        <Card.Section>
          <DataTable
            columnContentTypes={["text", "text", "text", "text", "text"]}
            headings={["Plan Name", "Status", "Test", "Trial Days", "Amount"]}
            rows={
              subscription.isLoading
                ? [["Loading..."]]
                : subscription.error
                ? [["Error", `${subscription.error}`]]
                : subscription.data
            }
          />
        </Card.Section>
      </Card>
    </>
  );
}
