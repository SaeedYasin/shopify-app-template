import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import RoutePropagator from "../router/RoutePropagator.jsx";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import { HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router";
import { GraphQLProvider } from "./GraphQLProvider.jsx";
import { ReactQueryProvider } from "./ReactQueryProvider.jsx";
import MenuProvider from "./MenuProvider.jsx";
import { ShopContextProvider } from "../hooks/index.js";
import { GlobalLoadingIndicator } from "../components/GlobalLoadingIndicator.jsx";

export default function AppProvider() {
  return (
    <PolarisProvider i18n={translations}>
      <AppBridgeProvider
        config={{
          apiKey: process.env.SHOPIFY_API_KEY,
          host: new URL(location.href).searchParams.get("host"),
          forceRedirect: true,
        }}
      >
        <ReactQueryProvider>
          <GlobalLoadingIndicator />
          <GraphQLProvider>
            <ShopContextProvider>
              <HelmetProvider>
                <MenuProvider />
                <Outlet />
                <RoutePropagator />
              </HelmetProvider>
            </ShopContextProvider>
          </GraphQLProvider>
        </ReactQueryProvider>
      </AppBridgeProvider>
    </PolarisProvider>
  );
}
