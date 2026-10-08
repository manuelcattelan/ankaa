import type { PickerItemValue } from "@expo/ui";

import { Host, Picker } from "@expo/ui";

import { Text } from "@/components/text";

type PickerFieldProperties<TOption extends PickerItemValue> = {
  label: string;
  onChangeSelectedOption: (selectedOption: TOption) => void;
  optionLabels: Record<TOption, string>;
  options: readonly TOption[];
  selectedOption: TOption;
};

export function PickerField<TOption extends PickerItemValue>({
  label,
  onChangeSelectedOption,
  optionLabels,
  options,
  selectedOption,
}: PickerFieldProperties<TOption>) {
  return (
    <>
      <Text>{label}</Text>
      <Host matchContents>
        <Picker
          onValueChange={onChangeSelectedOption}
          selectedValue={selectedOption}
        >
          {options.map((option) => (
            <Picker.Item
              key={option}
              label={optionLabels[option]}
              value={option}
            />
          ))}
        </Picker>
      </Host>
    </>
  );
}
