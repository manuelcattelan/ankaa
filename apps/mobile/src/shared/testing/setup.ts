import "expo-router/testing-library";

jest.mock("react-native-keyboard-controller", () =>
  jest.requireActual<object>("react-native-keyboard-controller/jest"),
);
