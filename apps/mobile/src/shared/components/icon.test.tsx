import type { ReactElement } from "react";
import type { SvgProps } from "react-native-svg";

import { render, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import type { TestRuntimeLayers } from "#/testing/create-test-runtime.ts";

import { Icon } from "#/shared/components/icon.tsx";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { color } from "#/shared/tokens/color.ts";
import { createTokenProviders } from "#/testing/create-token-providers.tsx";

// Renders the element with a test icon in place of an .svg file, which
// records the props Icon gives it, so a test checks them.
async function renderIcon({
  element,
  testRuntimeLayers,
}: {
  element: (testIcon: (props: SvgProps) => null) => ReactElement;
  testRuntimeLayers: TestRuntimeLayers;
}) {
  const renderedProps: SvgProps[] = [];

  function TestIcon(props: SvgProps) {
    renderedProps.push(props);

    return null;
  }

  await render(element(TestIcon), {
    wrapper: createTokenProviders(testRuntimeLayers),
  });

  return renderedProps;
}

describe("Icon", () => {
  it("sizes a Body icon to Body's 33 points at AX2, Jest's fontScale of 2", async () => {
    const renderedProps = await renderIcon({
      element: (testIcon) => (
        <Icon color={color.foreground} icon={testIcon} name="body" />
      ),
      testRuntimeLayers: {},
    });

    await waitFor(() => {
      expect(renderedProps.at(-1)).toMatchObject({ height: 33, width: 33 });
    });
  });

  it("sizes an Emphasized Title 1 icon by Title 1's growth, to 43 points at AX2", async () => {
    const renderedProps = await renderIcon({
      element: (testIcon) => (
        <Icon
          color={color.foreground}
          icon={testIcon}
          name="emphasizedTitle1"
        />
      ),
      testRuntimeLayers: {},
    });

    await waitFor(() => {
      expect(renderedProps.at(-1)).toMatchObject({ height: 43, width: 43 });
    });
  });

  it("strokes a Body icon with Body's regular Stroke when Bold Text is off", async () => {
    const renderedProps = await renderIcon({
      element: (testIcon) => (
        <Icon color={color.foreground} icon={testIcon} name="body" />
      ),
      testRuntimeLayers: {},
    });

    await waitFor(() => {
      expect(renderedProps.at(-1)).toMatchObject({ strokeWidth: 1 });
    });
  });

  it("strokes a Body icon with Body's Bold Text Stroke when Bold Text is on", async () => {
    const renderedProps = await renderIcon({
      element: (testIcon) => (
        <Icon color={color.foreground} icon={testIcon} name="body" />
      ),
      testRuntimeLayers: {
        accessibility: fakeAccessibilityLayer({ isBoldTextEnabled: true }),
      },
    });

    await waitFor(() => {
      expect(renderedProps.at(-1)).toMatchObject({ strokeWidth: 1.125 });
    });
  });

  it("colors the icon with the Foreground token it's given", async () => {
    const renderedProps = await renderIcon({
      element: (testIcon) => (
        <Icon color={color.secondaryForeground} icon={testIcon} name="body" />
      ),
      testRuntimeLayers: {},
    });

    await waitFor(() => {
      expect(renderedProps.at(-1)?.color).toBe(color.secondaryForeground);
    });
  });

  it("passes its style, opacity and accessibility props to the icon", async () => {
    const renderedProps = await renderIcon({
      element: (testIcon) => (
        <Icon
          aria-label="Rest"
          color={color.foreground}
          icon={testIcon}
          name="body"
          opacity={0.5}
          role="img"
          style={styles.icon}
        />
      ),
      testRuntimeLayers: {},
    });

    await waitFor(() => {
      expect(renderedProps.at(-1)).toMatchObject({
        "aria-label": "Rest",
        opacity: 0.5,
        role: "img",
        style: { alignSelf: "center" },
      });
    });
  });
});

const styles = StyleSheet.create({ icon: { alignSelf: "center" } });
