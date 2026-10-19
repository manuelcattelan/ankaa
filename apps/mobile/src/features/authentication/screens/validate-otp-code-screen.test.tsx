import { screen, userEvent } from "@testing-library/react-native";

import { AuthenticationClient } from "@/shared/services/authentication-client";
import { TrpcClient } from "@/shared/services/trpc-client";
import { createSignInTestResponses } from "@/shared/testing/create-sign-in-test-responses";
import { renderScreen } from "@/shared/testing/render-screen";

const VALIDATE_OTP_CODE_URL =
  "/sign-in/with-email/validate-otp-code?email=athlete%40example.com";

describe("ValidateOtpCodeScreen", () => {
  it("shows a validation message when the verification code is incomplete", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: VALIDATE_OTP_CODE_URL });

    await user.type(await screen.findByLabelText("Verification code"), "12345");

    await user.press(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText(
        "This verification code is incomplete: enter all 6 digits.",
      ),
    ).toBeOnTheScreen();
  });

  it("signs the person in and opens the home screen when the server accepts the verification code", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest(
          createSignInTestResponses("/sign-in/email-otp"),
        ),
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [] },
          routine: { list: () => [] },
        }),
      },
    });

    await user.type(
      await screen.findByLabelText("Verification code"),
      "123456",
    );

    await user.press(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("You have no routines yet."),
    ).toBeOnTheScreen();
  });

  it("shows an error message when the server rejects the verification code as incorrect", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/get-session": () => Response.json(null),
          "/sign-in/email-otp": () =>
            Response.json(
              { code: "INVALID_OTP", message: "Invalid OTP" },
              { status: 400 },
            ),
        }),
      },
    });

    await user.type(
      await screen.findByLabelText("Verification code"),
      "123456",
    );

    await user.press(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText(
        "This verification code is incorrect: check the verification code in your email and try again.",
      ),
    ).toBeOnTheScreen();
  });

  it("counts the resend cooldown down as time passes", async () => {
    renderScreen({ initialUrl: VALIDATE_OTP_CODE_URL });

    await screen.findByText(
      "You can resend the verification code in 60 seconds.",
    );

    await jest.advanceTimersByTimeAsync(1_000);

    expect(
      screen.getByText("You can resend the verification code in 59 seconds."),
    ).toBeOnTheScreen();
  });

  it("lets the person resend the verification code once the resend cooldown ends", async () => {
    renderScreen({ initialUrl: VALIDATE_OTP_CODE_URL });

    await screen.findByText(
      "You can resend the verification code in 60 seconds.",
    );

    await jest.advanceTimersByTimeAsync(60_000);

    expect(
      screen.getByRole("button", { name: "Resend verification code" }),
    ).toBeEnabled();
  });
});
