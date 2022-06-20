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
npx degit kanzitelli/shopify-app-template-typescript shopify-app-ts
```

2. Create Shopify app

- You can do it using [Shopify CLI](https://github.com/Shopify/shopify-cli):

```sh
shopify app create node
```

Then copy `.env` file to the typescript project and remove the one you just created.

- Or you can do it in the Shopify Partner Dashboard and then filling `.env` file with app's credentials (see `.env.example`).

_Note:_ `HOST` value will be auto-filled when you run the app.

3. Go to your app's directory and install packages

```sh
cd shopify-app-ts && yarn
```

_Note_: You could see error `fatal: not a git repository (or any of the parent directories): .git` that comes from `husky install` command. Once you do `git init`, it will disappear.

4. Remove `.github` folder

```sh
rm -rf .github
```

It contains files from [original template](https://github.com/Shopify/shopify-app-template-node) that are not necessary when building an app.

5. Run the app

```sh
shopify app serve
```

Install and start using the app by opening provided URL in your browser: _https://some-ngrok-subdomain-xxxx.ngrok.io/login?shop=your-shop-name.myshopify.com_

## Deployment

We will probably need to deploy it somewhere in the cloud when we are done with the app.

So `Dockerfile` and `Docker Compose` with `https://` setup will be coming soon...

## Enhancements

There are plans to create an advanced `shopify-app-starter` that will be powered by React Router, Mobx, a more opinionated structure, release-it, and other useful things.

## Motivation

I started developing a Shopify app some time ago that uses NextJS and Koa, which are deprecated in favour of pure React App and Express. The codebase was primarily written using TS, and it was painful to see that Shopify doesn't provide a new template with TS setup. There is the [issue](https://github.com/Shopify/shopify-app-template-node/issues/690) since January 2022 where people ask for TS support but no luck so far. So that's how this repo was born. I tried to keep it as close as possible to the [original repo](https://github.com/Shopify/shopify-app-template-node) but with TypeScript support.

## License

This repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
