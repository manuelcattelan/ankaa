import { render, screen, waitFor } from "@testing-library/react-native";
import {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

import { AnimatedView } from "#/shared/components/animated-view.tsx";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { createTokenProviders } from "#/testing/create-token-providers.tsx";

describe("AnimatedView", () => {
  it("enters and exits with the animations it's given when Reduce Motion is off", async () => {
    await render(
      <AnimatedView
        entering={SlideInDown}
        exiting={SlideOutDown}
        testID="animated-view"
      />,
      { wrapper: createTokenProviders({}) },
    );

    expect(screen.getByTestId("animated-view").props.entering).toBe(
      SlideInDown,
    );
    expect(screen.getByTestId("animated-view").props.exiting).toBe(
      SlideOutDown,
    );
  });

  it("fades in and out instead when Reduce Motion is on", async () => {
    await render(
      <AnimatedView
        entering={SlideInDown}
        exiting={SlideOutDown}
        testID="animated-view"
      />,
      {
        wrapper: createTokenProviders({
          accessibility: fakeAccessibilityLayer({
            isReduceMotionEnabled: true,
          }),
        }),
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId("animated-view").props.entering).toBe(FadeIn);
    });
    expect(screen.getByTestId("animated-view").props.exiting).toBe(FadeOut);
  });

  it("adds no animation of its own when Reduce Motion is on", async () => {
    await render(
      <>
        <AnimatedView entering={SlideInDown} testID="animated-view" />
        <AnimatedView testID="unanimated-view" />
      </>,
      {
        wrapper: createTokenProviders({
          accessibility: fakeAccessibilityLayer({
            isReduceMotionEnabled: true,
          }),
        }),
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId("animated-view").props.entering).toBe(FadeIn);
    });
    expect(screen.getByTestId("animated-view").props.exiting).toBeUndefined();
    expect(
      screen.getByTestId("unanimated-view").props.entering,
    ).toBeUndefined();
  });
});
