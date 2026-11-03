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
- **`ANDROID_`**: development only. Production leaves them unset until Android is distributed, because no Android release key exists yet, and development's fingerprint is React Native's public debug key.
- **`BETTER_AUTH_SECRET`**: generated with `openssl rand -base64 32`.
- **`BETTER_AUTH_URL` and `EXPO_PUBLIC_API_URL`**: the environment's API host, from the table of environments.
- **`APP_VARIANT`**: the environment's name, `development` or `production`.

## Setting up GitHub

These steps run once, outside the repository, in this order.

- **Repository settings**: allow merge commits only, and let a pull request's branch be updated from `main`, with `gh repo edit --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --allow-update-branch` ([GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges)).
- **Actions settings**: require every action to be pinned to a full-length commit SHA, and require approval for workflow runs from all external contributors ([GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)).
- **Ruleset**: once a pull request has run `CI`, because GitHub offers only a check that ran in the last 7 days as required, create an active branch ruleset on the default branch with an empty bypass list. It restricts deletions, blocks force pushes, requires a pull request with 0 approvals and merge commits as its only merge method, and requires the status checks `quality` and `test` from GitHub Actions on a branch that is up to date before merging ([GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)).

## Checking pull requests

- Every pull request against `main` runs `CI`, and it merges, with a merge commit, only once its `quality` and `test` jobs pass on a branch up to date with `main`. Nobody bypasses the ruleset, the maintainer included, because agents act with the maintainer's credentials.
- When you rename a job that the ruleset requires, or add a job that must pass, change the ruleset's required checks in the same change, because the ruleset lives outside the repository, and a required check that no job reports leaves every pull request waiting.
- Pin each action to a full commit SHA with its version in a comment, as in `uses: actions/checkout@<sha> # v7.0.1`, because a tag can move to other code, and the repository's settings fail every workflow that pins an action otherwise ([GitHub](https://docs.github.com/en/actions/reference/security/secure-use)).
