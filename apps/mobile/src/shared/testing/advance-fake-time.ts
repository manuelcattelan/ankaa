import { act } from "@testing-library/react-native";

export async function advanceFakeTime(milliseconds: number) {
  await act(() => jest.advanceTimersByTimeAsync(milliseconds));
}
