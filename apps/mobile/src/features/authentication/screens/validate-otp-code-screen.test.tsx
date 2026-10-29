import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { constVoid } from "effect/Function";

import { createFakeSignInResponses } from "#/shared/testing/create-fake-sign-in-responses.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

const VALIDATE_OTP_CODE_URL =
  "/sign-in/with-email/validate-otp-code?email=anna%40example.com";

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

  it("shows no validation message before the first submit", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: VALIDATE_OTP_CODE_URL });

    await user.type(await screen.findByLabelText("Verification code"), "12345");

    expect(
      screen.queryByText(
        "This verification code is incomplete: enter all 6 digits.",
      ),
    ).not.toBeOnTheScreen();
  });

  it("clears the validation message as soon as the User completes the verification code", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: VALIDATE_OTP_CODE_URL });

    await user.type(await screen.findByLabelText("Verification code"), "12345");

    await user.press(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText(
      "This verification code is incomplete: enter all 6 digits.",
    );

    await user.type(screen.getByLabelText(/^Verification code/), "6");

    expect(
      screen.queryByText(
        "This verification code is incomplete: enter all 6 digits.",
      ),
    ).not.toBeOnTheScreen();
  });

  it("signs the User in and opens the home screen when the server accepts the verification code", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer(
          createFakeSignInResponses({ signInPath: "/sign-in/email-otp" }),
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
        authenticationClient: fakeAuthenticationClientLayer({
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

  it("shows how many seconds the User must wait when the server rate-limits the sign-in", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/sign-in/email-otp": () =>
            Response.json(
              { message: "Too many requests. Please try again later." },
              { headers: { "X-Retry-After": "30" }, status: 429 },
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
      await screen.findByText("Too many requests: try again in 30 seconds."),
    ).toBeOnTheScreen();
  });

  it("tells the User to request a new verification code when the server rejects it as expired", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/sign-in/email-otp": () =>
            Response.json(
              { code: "OTP_EXPIRED", message: "OTP expired" },
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
        "This verification code has expired: resend the verification code and try again.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User to request a new verification code when the server rejects too many attempts", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/sign-in/email-otp": () =>
            Response.json(
              { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts" },
              { status: 403 },
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
        "Too many incorrect attempts: resend the verification code and try again.",
      ),
    ).toBeOnTheScreen();
  });

  it("requests a new verification code as soon as the User resends it", async () => {
    const otpCodeRequestBodies: unknown[] = [];
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/email-otp/send-verification-otp": async (request) => {
            const otpCodeRequestBody: unknown = await request.json();

            otpCodeRequestBodies.push(otpCodeRequestBody);

            return Response.json({ success: true });
          },
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Resend verification code" }),
    );

    await waitFor(() => {
      expect(otpCodeRequestBodies).toEqual([
        { email: "anna@example.com", type: "sign-in" },
      ]);
    });
  });

  it("disables resending the verification code while its request is in flight", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/email-otp/send-verification-otp": () => new Promise(constVoid),
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Resend verification code" }),
    );

    expect(
      await screen.findByRole("button", {
        busy: true,
        name: "Resend verification code",
      }),
    ).toBeDisabled();
  });

  it("lets the User resend the verification code again once the previous request is answered", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: VALIDATE_OTP_CODE_URL,
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/email-otp/send-verification-otp": () =>
            Response.json({ success: true }),
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Resend verification code" }),
    );

    expect(
      await screen.findByRole("button", {
        busy: false,
        name: "Resend verification code",
      }),
    ).toBeEnabled();
  });
});
