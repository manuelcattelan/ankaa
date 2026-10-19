import { fireEvent, screen } from "@testing-library/react-native";

type ChoosePickerFieldOptionOptions = {
  label: string;
  option: string;
};

export function choosePickerFieldOption({
  label,
  option,
}: ChoosePickerFieldOptionOptions) {
  fireEvent(screen.getByTestId(label), "valueChange", option);
}
