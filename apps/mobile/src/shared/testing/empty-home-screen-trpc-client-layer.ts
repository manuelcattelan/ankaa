import { TrpcClient } from "@/shared/services/trpc-client";

export const emptyHomeScreenTrpcClientLayer = TrpcClient.layerTest({
  exercise: { list: () => [] },
  routine: { list: () => [] },
});
