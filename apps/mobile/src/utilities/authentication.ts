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

type SendAuthenticationRequest<TData> = (
  fetchOptions: AuthenticationFetchOptions,
) => Promise<AuthenticationResponse<TData>>;

type SendVerificationCodeOptions = {
  email: string;
};

type UnwrapAuthenticationResponseOptions<TData> = {
  response: AuthenticationResponse<TData>;
  retryAfterSeconds?: number;
};

const RETRY_AFTER_HEADER = "X-Retry-After";

export async function sendAuthenticationRequest<TData>(
  sendRequest: SendAuthenticationRequest<TData>,
) {
  let retryAfterSeconds: number | undefined;

  const response = await sendRequest({
    onError: (context) => {
      const header = context.response.headers.get(RETRY_AFTER_HEADER);

      if (header) {
        retryAfterSeconds = Number(header);
      }
    },
  });

  return unwrapAuthenticationResponse({ response, retryAfterSeconds });
}

export function sendVerificationCode({ email }: SendVerificationCodeOptions) {
  return sendAuthenticationRequest((fetchOptions) =>
    authenticationClient.emailOtp.sendVerificationOtp(
      { email, type: "sign-in" },
      fetchOptions,
    ),
  );
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
