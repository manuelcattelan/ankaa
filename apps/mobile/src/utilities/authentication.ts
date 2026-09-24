import { authenticationClient } from "@/clients/authentication";
import { createAuthenticationError } from "@/utilities/errors";

type AuthenticationFetchOptions = {
  onError: (context: { response: Response }) => void;
};

type AuthenticationResponse<TData> =
  | {
      data: null;
      error: {
        code?: string;
        message?: string;
        status: number;
        statusText: string;
      };
    }
  | { data: TData; error: null };

type RequestOtpCodeOptions = {
  email: string;
};

type SendAuthenticationRequest<TData> = (
  fetchOptions: AuthenticationFetchOptions,
) => Promise<AuthenticationResponse<TData>>;

type UnwrapAuthenticationResponseOptions<TData> = {
  response: AuthenticationResponse<TData>;
  retryAfterSeconds?: number;
};

export function requestOtpCode({ email }: RequestOtpCodeOptions) {
  return sendAuthenticationRequest((fetchOptions) =>
    authenticationClient.emailOtp.sendVerificationOtp(
      { email, type: "sign-in" },
      fetchOptions,
    ),
  );
}

export async function sendAuthenticationRequest<TData>(
  sendRequest: SendAuthenticationRequest<TData>,
) {
  let retryAfterSeconds: number | undefined;

  const response = await sendRequest({
    onError: (context) => {
      const retryAfterHeader = context.response.headers.get("X-Retry-After");

      if (retryAfterHeader) {
        retryAfterSeconds = Number(retryAfterHeader);
      }
    },
  });

  return unwrapAuthenticationResponse({ response, retryAfterSeconds });
}

function unwrapAuthenticationResponse<TData>({
  response,
  retryAfterSeconds,
}: UnwrapAuthenticationResponseOptions<TData>) {
  if (response.error) {
    throw createAuthenticationError({
      code: response.error.code,
      message: response.error.message ?? response.error.statusText,
      retryAfterSeconds,
      status: response.error.status,
    });
  }

  return response.data;
}
