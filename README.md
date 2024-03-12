# Shopify App Node with TypeScript

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

> **Warning**
> This is an old CLI2.0 template and is no longer being maintained.
> New template with CLI3.0 can be found here, _https://github.com/SaeedYasin/shopify-app-template-node_

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

- Create a SECOND public app in your Shopify partner account. As App url and allowed redirect urls simply add https://localhost/ for now. It's important to have two apps, one created previously for development and a new one which will be your production app. I would suggest to call them differently, I simply use the same name and add "(development)" in the name of the one I use in development.
- Deploy to any hosting service and configure your env variables on it (from the production app we just created) and get its public URL.
- Make sure to update your App URL and allowed redirect_uri in shopify partners dashboard for our production app.
- Back to your Shopify Partner Admin, go to your newly created app (the production one) and in your app setup, paste the url from your hosting service in the App url (e.g https://your-app-domain.com/), and in the Allowed redirection URL(s) add the same url from heroku with the suffix /auth/token and auth/callback. e.g. https://your-app-domain.com/auth/token and https://your-app-domain.com/auth/callback. Add your gdpr routes as well i-e https://your-app-domain.com/gdpr/customers_data_request, https://your-app-domain.com/gdpr/customers_redact, https://your-app-domain.com/gdpr/shop_redact.
- Then using https://your-app-domain.com/login?shop=your-shop-name.myshopify.com you can install the app to test it out.

Every time you work on your development app, you can just follow the workflow described above, and when you are ready to push your changes to production, you will simply need to commit and push your changes to Github as normal, and your hosting service maybe can pick up these new changes and push to your app and deploy the new changes to your hosted app.

This means, one code base but 2 apps, this is the most common workflow used by App Developers. 🎉

Thanks to [kanzitelli](https://github.com/kanzitelli/shopify-app-template-typescript) and [Jonathan Giardino](https://github.com/jonathangiardino/shopify-app-starter) shopify app starter template for many of the ideas and code samples used in this template.

## License

This repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
