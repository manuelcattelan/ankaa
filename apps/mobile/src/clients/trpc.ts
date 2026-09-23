import type { AppRouter } from "@ankaa/api";

import { createTRPCContext } from "@trpc/tanstack-react-query";

const trpcContext = createTRPCContext<AppRouter>();
export const TrpcProvider = trpcContext.TRPCProvider;
export const useTrpc = trpcContext.useTRPC;
export const useTrpcClient = trpcContext.useTRPCClient;
