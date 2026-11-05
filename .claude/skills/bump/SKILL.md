---
name: bump
description: Upgrades the dependencies that Renovate's Dependency Dashboard issue lists, vulnerability fixes included, on one branch and pull request, following Expo's procedure for the mobile app. Use when the maintainer asks to upgrade, bump or update dependencies.
argument-hint: "[packages to limit the upgrade to]"
disable-model-invocation: true
---

# Bump

Upgrade every update that the Dependency Dashboard lists, or only the packages in `$ARGUMENTS` when it names any. Read `INFRASTRUCTURE.md` first: its **Updating dependencies** section holds the rules this skill applies, and spec [#186](https://github.com/manuelcattelan/ankaa/issues/186) holds their reasons.

## Read the dashboard

Find the open issue that the Renovate app keeps, then read it:

```sh
gh issue list --author "app/renovate" --search "Dependency Dashboard in:title" --state open
gh issue view <number>
```

- **Pending Approval** lists the updates to make. An entry that ends in `[security]` fixes a known vulnerability: make it even when the rest of the session stops short.
- **Pending Status Checks** lists releases still inside Renovate's 3-day `minimumReleaseAge`. Skip them, because they move to Pending Approval once they're old enough.
- **Abandoned Dependencies** lists packages with no release for a long time. Don't replace one: name it in the pull request, because replacing a dependency is the maintainer's decision.
- **Detected Dependencies** is the inventory of every dependency and where it's declared. Use it to find each file that a package's version lives in.

Never tick a checkbox and never edit or close the issue. A ticked checkbox makes Renovate open its own branch and pull request, which would conflict with this branch. An entry leaves the dashboard by itself once Renovate's next run sees the upgrade on `main`.

## Upgrade

Work on one branch from the tip of `main`, and commit each group of packages that moves together, such as one Expo SDK, one monorepo or the GitHub Actions, as its own commit, so a break bisects to one group.

### The mobile app

Expo decides the versions of the mobile app's packages, and its versions win over Renovate's. Renovate doesn't know which versions work with an Expo SDK.

- When the dashboard lists a newer `expo`, upgrade one SDK at a time, following [Expo's upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) and the `expo-upgrade` skill from [Expo Skills](https://github.com/expo/skills) when it's installed:
  1. `pnpm --filter @ankaa/mobile add expo@^<next SDK>`
  2. `pnpm --filter @ankaa/mobile exec expo install --fix`
  3. `cd apps/mobile && pnpm dlx expo-doctor`, from the workspace, because Expo Doctor runs `npx expo config`, which fails from the repository's root

  Then read that SDK's changelog and upgrade guide, and Expo Router's migration guide, and adapt the code to every breaking change.

- Install every other mobile package with `pnpm --filter @ankaa/mobile exec expo install <package>@<version>`, as `apps/mobile/AGENTS.md` requires.
- Leave a dashboard entry whose version is above what the SDK allows, such as a `react-native-*` version a later SDK pins, and name it in the pull request. It stays on the dashboard until a later SDK allows it.
- pnpm waits 1 day before it installs a new release. When `expo install --fix` asks for a version younger than that, stop and tell the maintainer to run the session again the next day, and never lower `minimumReleaseAge`.
- When a package with native code changes, or the SDK does, build the app with `pnpm --filter @ankaa/mobile exec expo prebuild --clean` and `pnpm --filter @ankaa/mobile exec expo run:ios --no-bundler`, because CI doesn't build it, and a version off the SDK can pass every test and still break the native build.

### Everything else

- Move a dependency in the pnpm `catalog:` of `pnpm-workspace.yaml`, never in a workspace's `package.json`, so every workspace that refers to it moves together. A catalog dependency the mobile app shares with the server, such as `effect`, tRPC or better-auth, must still pass the mobile app's checks.
- Move any other npm dependency in the `package.json` that declares it, then run `pnpm install`.
- Move a GitHub Action to the commit of its new tag, with the version in its comment, as `INFRASTRUCTURE.md` requires. Take the SHA from `gh api repos/<owner>/<repository>/commits/<tag> --jq .sha`.
- Move Node.js or pnpm in every place that names it in the same commit: `devEngines` in the root `package.json`, the build profile in `apps/mobile/eas.json`, and the images in `apps/server/Dockerfile`, because EAS ignores `devEngines`.
- For each major version, read its release notes or migration guide and adapt the code to its breaking changes, following the repository's `AGENTS.md` files and their glossary terms.

Keep `pnpm-lock.yaml` one YAML document. If a `packageManagerDependencies` document comes back at its top, `pmOnFail: ignore` has been lost from `pnpm-workspace.yaml`, and GitHub's dependency graph, and with it Renovate's vulnerability data, stops reading the lockfile.

When an upgrade breaks something you can't fix within the session, revert that group, leave its entry on the dashboard, and name it in the pull request with what broke.

## Check

Start Docker before the tests. Every check must pass:

- `pnpm format`, `pnpm lint --continue`, `pnpm check-types --continue` and `pnpm test --continue`.
- `pnpm check-versions:mobile`, the check that CI's `quality` job runs.
- `cd apps/mobile && pnpm dlx expo-doctor`, when a mobile package moved.
- `pnpm install --frozen-lockfile`, which must leave `pnpm-lock.yaml` unchanged.
- The development build, when native code changed.

## Open the pull request

Push the branch and open a pull request against `main`. Its description has these sections, as [#184](https://github.com/manuelcattelan/ankaa/pull/184) does:

- **What moves**: each group of packages, from its old version to its new one.
- **Changes for the breaking changes**: each code change, with the breaking change it answers and a link to its source.
- **Decisions to review**: anything the maintainer should confirm, such as a lint rule turned off.
- **Not in this pull request**: every dashboard entry left, with its reason: still under 3 days old, above what the SDK allows, broken, or abandoned.
- **Checked**: the checks above and their results.
- **After merging**: rebuild the development build when native code changed.

Never deploy the server or the app, because `INFRASTRUCTURE.md` allows a deploy only when the maintainer asks.
