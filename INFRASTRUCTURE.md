---
paths:
  - ".dockerignore"
  - ".env.example"
  - ".github/**"
  - "apps/mobile/.env.example"
  - "apps/mobile/app.config.ts"
  - "apps/mobile/eas.json"
  - "apps/server/Dockerfile"
  - "apps/server/fly.toml"
  - "renovate.json"
---

# Infrastructure

This document covers what the repository can't show about where Ankaa runs: its environments, where each setting lives, and where each value comes from. The files that tools read, such as `.env.example` and `app.config.ts`, hold the rest.

## Environments

| Environment | Server                                                             | API host                      | App                                                              |
| ----------- | ------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------- |
| Development | The maintainer's laptop, reached through ngrok (`pnpm dev:tunnel`) | The maintainer's ngrok domain | A development build, made locally                                |
| Production  | Fly.io                                                             | `api.ankaa.app`               | A production build, made on EAS and installed through TestFlight |

- Point each build of the app at its own environment's server only, because the server names a single bundle id and Google iOS client for Sign in with Apple, Google Sign-In and the Universal Links of Account deletion.
- Name each environment `development` or `production` everywhere, in `NODE_ENV` and in EAS, and leave EAS's `preview` environment unused.
- Tests set their own settings in code, and every deploy runs from the maintainer's laptop, so CI holds no secrets: its only credential is the token GitHub gives each run.

## Where settings live

| Environment | Server                                                                                       | App build                                                    |
| ----------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Development | The root `.env`                                                                              | `apps/mobile/.env`                                           |
| Production  | Fly.io's secrets, and `[env]` in the server's `fly.toml` for the settings that aren't secret | The EAS `production` environment, with Plain text visibility |

- Give production its own value for every credential, never development's, so a leaked `.env` can't reach production.
- Never put a secret in an `EXPO_PUBLIC_` variable, because Expo inlines it into the app in plain text, and EAS shows these variables on its website ([Expo](https://docs.expo.dev/guides/environment-variables/)).
- Put a production server setting in `[env]` in the server's `fly.toml` when it isn't secret, and in Fly.io's secrets otherwise, so a value that `fly.toml` must agree with, such as the port, sits next to it.

## Where values come from

The value of each setting comes from the service that its name starts with.

- **`APPLE_`**: Apple Developer, where one team holds both environments. The Team ID from the membership details, the environment's bundle id, and the Sign in with Apple key whose primary App ID is that bundle id, whose `.p8` file downloads only once. Name each environment's App ID and key `ankaa-development` or `ankaa-production`.
- **`GOOGLE_` and `EXPO_PUBLIC_GOOGLE_`**: Google Cloud, in the environment's own project, `ankaa-development` or `ankaa-production`, because Google's OAuth policy requires separate projects ([Google](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance)). Its Web OAuth client, and the iOS OAuth client of the environment's bundle id.
- **`RESEND_`**: Resend. An API key per environment with sending access to `ankaa.app` only. The sender is `Ankaa <notifications@ankaa.app>` in production and `Ankaa Development <notifications@ankaa.app>` in development, so a development email is never mistaken for production's.
- **`DATABASE_URL_`**: Neon. The pooled and direct connection strings of the environment's branch, `production` or `development`, both in one Neon project on the Free plan, each with its own password for `neondb_owner`.
- **`BETTER_AUTH_SECRET`**: generated with `openssl rand -base64 32`.
- **`BETTER_AUTH_URL` and `EXPO_PUBLIC_API_URL`**: the environment's API host, from the table of environments.
- **`APP_VARIANT`**: the environment's name, `development` or `production`.

## Setting up GitHub

These steps run once, outside the repository, in this order.

- **Repository settings**: allow merge commits only, and let a pull request's branch be updated from `main`, with `gh repo edit --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --allow-update-branch` ([GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges)).
- **Actions settings**: require every action to be pinned to a full-length commit SHA, and require approval for workflow runs from all external contributors ([GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)).
- **Ruleset**: once a pull request has run `CI`, because GitHub offers only a check that ran in the last 7 days as required, create an active branch ruleset on the default branch with an empty bypass list. It restricts deletions, blocks force pushes, requires a pull request with 0 approvals and merge commits as its only merge method, and requires the status checks `quality` and `test` from GitHub Actions on a branch that is up to date before merging ([GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)).
- **Renovate**: install the [Mend Renovate app](https://github.com/apps/renovate) on Ankaa only, never on all repositories, because it would put every other repository the maintainer owns into onboarding or silent mode. The app reads the committed `renovate.json`, so it opens no onboarding pull request and there's nothing to merge ([Renovate](https://docs.renovatebot.com/config-overview/#onboarding)).
- **Dependabot**: turn on Dependabot alerts, which give Renovate its vulnerability data, and leave Dependabot security updates off, because Renovate lists those fixes instead ([GitHub](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-dependabot-alerts), [Renovate](https://docs.renovatebot.com/configuration-options/#vulnerabilityalerts)).

## Setting up production

These steps run once, outside the repository, in this order.

- **Neon**: in Ankaa's project, name the root branch `production` and create the `development` branch from it. Reset `neondb_owner`'s password on both branches ([Manage roles](https://neon.com/docs/manage/roles)), then truncate every table in production's `public` and `authentication` schemas, leaving `drizzle` untouched.
- **Apple Developer**: register the explicit App ID `app.ankaa`, named `ankaa-production`, with Sign in with Apple ([Register an App ID](https://developer.apple.com/help/account/identifiers/register-an-app-id)). Create a Sign in with Apple key named `ankaa-production`, with `app.ankaa` as its primary App ID ([Create a private key](https://developer.apple.com/help/account/capabilities/create-a-sign-in-with-apple-private-key/)).
- **Google Cloud**: create the project `ankaa-production`, with its OAuth consent screen for external users, each tester added as a test user, and the app left in Testing, because publishing it needs Google's brand verification ([Google](https://support.google.com/cloud/answer/15549945)). Create a Web client and an iOS client for `app.ankaa` ([Create credentials](https://developers.google.com/workspace/guides/create-credentials)).
- **Fly.io**: create the app with `fly apps create ankaa-server`, in an organization with a payment method ([Billing](https://docs.fly.io/about/billing)). Set every setting of `.env.example` with `fly secrets set` ([Secrets](https://docs.fly.io/apps/secrets)), except those in `[env]` in the server's `fly.toml`. Then request the API host's certificate with `fly certs add api.ankaa.app` ([Custom domains](https://docs.fly.io/networking/custom-domain)).
- **Vercel DNS**: in the `ankaa.app` zone, add the `api` CNAME and the `_acme-challenge` CNAME that `fly certs setup api.ankaa.app` prints ([Vercel](https://vercel.com/docs/domains/managing-dns-records)). The `api` record must be explicit, because the `*.ankaa.app` wildcard points every other subdomain at Vercel.
- **Expo**: in the `ankaa-mobile` organization, create the project with `eas init` from the app's workspace, and set every setting of the app's `.env.example` in its `production` environment, with `APP_VARIANT` set to `production` and Plain text visibility, using `eas env:set` ([Environment variables](https://docs.expo.dev/eas/environment-variables/manage/)). Run the first `pnpm deploy:mobile` interactively. Let it create the distribution certificate and the provisioning profile, signing in to Apple when it asks ([Managed credentials](https://docs.expo.dev/app-signing/managed-credentials/)), and generate an App Store Connect API key with the App Manager role when it asks ([Submit iOS](https://docs.expo.dev/submit/ios/)).
- **App Store Connect**: once the first deploy has created the app's record, set the app's Apple ID from App Information as `ascAppId` in the `production` submit profile, so later deploys skip signing in to Apple. Check that each tester is in an internal TestFlight group with automatic distribution. The first submission creates one as "Team (Expo)" when it can ([Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)).

## Building the app

- Make development builds locally with `expo run:ios`, and only production builds on EAS, because EAS's Free plan gives 15 iOS builds a month on a queue that can wait 90 minutes ([Expo](https://expo.dev/pricing)).
- Keep `node` and `pnpm` in the EAS build profile equal to `devEngines` in the root `package.json`, because EAS ignores `devEngines` and its image ships older versions ([Expo](https://docs.expo.dev/build-reference/infrastructure/)).

## Checking pull requests

- Every pull request against `main` runs `CI`, and it merges, with a merge commit, only once its `quality` and `test` jobs pass on a branch up to date with `main`. Nobody bypasses the ruleset, the maintainer included, because agents act with the maintainer's credentials.
- When you rename a job that the ruleset requires, or add a job that must pass, change the ruleset's required checks in the same change, because the ruleset lives outside the repository, and a required check that no job reports leaves every pull request waiting.
- Pin each action to a full commit SHA with its version in a comment, as in `uses: actions/checkout@<sha> # v7.0.1`, because a tag can move to other code, and the repository's settings fail every workflow that pins an action otherwise ([GitHub](https://docs.github.com/en/actions/reference/security/secure-use)).

## Updating dependencies

- Renovate lists every outdated dependency and every fix for a known vulnerability on its Dependency Dashboard issue, and opens a pull request only for an update whose checkbox the maintainer ticks, because the maintainer upgrades with an agent, whose branches Renovate's own pull requests would conflict with ([Renovate](https://docs.renovatebot.com/configuration-options/#dependencydashboardapproval)).
- Upgrade the dependencies the Dependency Dashboard lists with the `/bump` skill, because it holds the upgrade procedure, and never tick a checkbox on the dashboard, because Renovate then opens its own pull request.
- When you upgrade, follow Expo's upgrade procedure, its skills and the versions it recommends for the mobile app's packages, even when Renovate lists a newer version, because Renovate doesn't know which versions work with an Expo SDK ([Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)).

## Deploying the server

- Deploy with `pnpm deploy:server` from the repository's root, because the image builds from the whole monorepo. Fly.io builds the image on its own builder, so Docker needn't run locally.
- Deploy, or change the Fly.io app, its secrets or its certificate, only when the maintainer asks. A deploy changes production, and it runs every new migration and the seed against production's database before the new version starts.
- Undo a bad deploy by deploying code without the bad change, such as `main` or a revert of it, so there's a single way to deploy. Migrations have no down step, so an older image would run on the new schema anyway.

## Deploying the app

- Deploy with `pnpm deploy:mobile` from the repository's root. EAS builds the app and submits it to TestFlight, where internal testers get it once Apple has processed it. The command returns once the project is uploaded, so follow the build on its EAS page.
- Deploy only when the maintainer asks, because each deploy spends one of the 15 iOS builds that EAS's Free plan gives each month ([Expo](https://expo.dev/pricing)), and puts a build that calls the production server on the testers' phones.
- When a change touches both the server and the app, deploy the server first, then the app from the same working tree, because the build calls the production server. An installed build may break after a server deploy until the next build is installed, so deploy the app right after a server change it depends on.
- Deploy the app at least every 90 days, because a TestFlight build stops working 90 days after its upload ([Apple](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview)).
- Leave the app's `version` unchanged, because EAS numbers every build and no build goes live on the App Store.
- Add a tester as an App Store Connect user, with a role that TestFlight accepts for internal testers, to the internal group, and as a test user of the `ankaa-production` Google project, because production's Google sign-in stays in Testing ([Apple](https://developer.apple.com/testflight/), [Google](https://support.google.com/cloud/answer/15549945)).
