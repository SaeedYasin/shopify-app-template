# Shopify App Node with TypeScript

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

This is a sample app (**with TypeScript**) to help developers bootstrap their Shopify app development.

It leverages the [Shopify API Library](https://github.com/Shopify/shopify-node-api) on the backend to create [an embedded app](https://shopify.dev/apps/tools/app-bridge/getting-started#embed-your-app-in-the-shopify-admin), and [Polaris](https://github.com/Shopify/polaris-react) and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components) on the frontend.

The original template (with JavaScript) is [Shopify/shopify-app-template-node](https://github.com/Shopify/shopify-app-template-node) that is used when you create a new Node app with the [Shopify CLI](https://shopify.dev/apps/tools/cli).

## Requirements

- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- **If you are not using the Shopify CLI**, in the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## Quickstart

1. Clone the repo

```sh
npx degit SaeedYasin/shopify-app-template shopify-app-ts
```

2. Create Shopify app

- You can do it using [Shopify CLI](https://github.com/Shopify/shopify-cli):

```sh
shopify app create node
```

Then copy `.env` file to the typescript project and remove the one you just created.

- Or you can do it in the Shopify Partner Dashboard and then filling `.env` file with app's credentials (see `.env.example`).

_Note:_ `HOST` value will be auto-filled when you run the app.

- Add your database connection URL as well in .env for DATABASE_URL env variable.

3. Go to your app's directory and install packages

```sh
cd shopify-app-ts && pnpm i
```

4. Run the app

```sh
shopify app serve
```

Install and start using the app by opening provided URL in your browser: _https://some-ngrok-subdomain-xxxx.ngrok.io/login?shop=your-shop-name.myshopify.com_

## Deployment

- Deploy to any hosting service and configure your env variables on it and get its public URL.
- Make sure to update your App URL and allowed redirect_uri in shopify partners dashboard.
- Then using https://your-app-domain.com/login?shop=your-shop-name.myshopify.com you can install the app.
- Keep in mind running `shopify app serve` will automatically override App URL with ngrok URL in partners dashboard.

## License

This repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
