import { screen, userEvent } from "@testing-library/react-native";

import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

describe("WithEmailScreen", () => {
  it("shows a validation message when the email address isn't valid", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: "/sign-in/with-email" });

    await user.type(
      await screen.findByLabelText("Email address"),
      "anna@example",
    );

    await user.press(
      screen.getByRole("button", { name: "Continue with email address" }),
    );

    expect(
      await screen.findByText(
        "This email address isn't valid: enter an address like name@example.com.",
      ),
    ).toBeOnTheScreen();
  });

  it("shows no validation message before the first submit", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: "/sign-in/with-email" });

    await user.type(
      await screen.findByLabelText("Email address"),
      "anna@example",
    );

    expect(
      screen.queryByText(
        "This email address isn't valid: enter an address like name@example.com.",
      ),
    ).not.toBeOnTheScreen();
  });

  it("clears the validation message as soon as the User corrects the email address", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: "/sign-in/with-email" });

    await user.type(
      await screen.findByLabelText("Email address"),
      "anna@example",
    );

    await user.press(
      screen.getByRole("button", { name: "Continue with email address" }),
    );

    await screen.findByText(
      "This email address isn't valid: enter an address like name@example.com.",
    );

    await user.type(screen.getByLabelText(/^Email address/), ".com");

    expect(
      screen.queryByText(
        "This email address isn't valid: enter an address like name@example.com.",
      ),
    ).not.toBeOnTheScreen();
  });

  it("shows the email address error in the field without announcing it again", async () => {
    const announcedMessages: string[] = [];
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/sign-in/with-email",
      testRuntimeLayers: {
        accessibility: fakeAccessibilityLayer(announcedMessages),
      },
    });

    await user.type(
      await screen.findByLabelText("Email address"),
      "anna@example",
    );

    await user.press(
      screen.getByRole("button", { name: "Continue with email address" }),
    );

    await screen.findByText(
      "This email address isn't valid: enter an address like name@example.com.",
    );

    expect(announcedMessages).toEqual([
      "This email address isn't valid: enter an address like name@example.com.",
    ]);
  });

  it("requests a verification code and moves on to entering it when the email address is valid", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/sign-in/with-email",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/email-otp/send-verification-otp": () =>
            Response.json({ success: true }),
        }),
      },
    });

    await user.type(
      await screen.findByLabelText("Email address"),
      "anna@example.com",
    );

    await user.press(
      screen.getByRole("button", { name: "Continue with email address" }),
    );

    expect(await screen.findByLabelText("Verification code")).toBeOnTheScreen();
  });
});
