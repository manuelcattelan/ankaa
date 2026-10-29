import { screen, userEvent, waitFor } from "@testing-library/react-native";

import { AuthenticationClient } from "@/shared/services/authentication-client";
import { advanceFakeTime } from "@/shared/testing/advance-fake-time";
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
      },
    });

    await user.type(
      await screen.findByLabelText("Verification code"),
      "123456",
    );

    await user.press(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("button", { name: "Sign out" }),
    ).toBeOnTheScreen();
  });

  it("shows an error message when the server rejects the verification code as incorrect", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest({
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

    await advanceFakeTime(1_000);

    expect(
      screen.getByText("You can resend the verification code in 59 seconds."),
    ).toBeOnTheScreen();
  });

  it("lets the person resend the verification code once the resend cooldown ends", async () => {
    renderScreen({ initialUrl: VALIDATE_OTP_CODE_URL });

    await screen.findByText(
      "You can resend the verification code in 60 seconds.",
    );

    await advanceFakeTime(60_000);

    expect(
      screen.getByRole("button", { name: "Resend verification code" }),
    ).toBeEnabled();
  });

  it("requests a new verification code when the person resends it once the resend cooldown ends", async () => {
    const otpCodeRequestBodies: unknown[] = [];
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/email-otp/send-verification-otp": async (request) => {
            const otpCodeRequestBody: unknown = await request.json();

            otpCodeRequestBodies.push(otpCodeRequestBody);

            return Response.json({ success: true });
          },
        }),
      },
    });

    await screen.findByText(
      "You can resend the verification code in 60 seconds.",
    );

    await advanceFakeTime(60_000);

    await user.press(
      screen.getByRole("button", { name: "Resend verification code" }),
    );

    await waitFor(() => {
      expect(otpCodeRequestBodies).toEqual([
        { email: "athlete@example.com", type: "sign-in" },
      ]);
    });
  });

  it("restarts the resend cooldown once the person resends the verification code", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/email-otp/send-verification-otp": () =>
            Response.json({ success: true }),
        }),
      },
    });

    await screen.findByText(
      "You can resend the verification code in 60 seconds.",
    );

    await advanceFakeTime(60_000);

    await user.press(
      screen.getByRole("button", { name: "Resend verification code" }),
    );

    expect(
      await screen.findByText(
        "You can resend the verification code in 60 seconds.",
      ),
    ).toBeOnTheScreen();
  });
});
