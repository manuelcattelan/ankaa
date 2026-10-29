import { Host, Picker } from "@expo/ui";

import { Text } from "#/shared/components/text.tsx";

export function PickerField<TOption extends string>({
  label,
  onChangeSelectedOption,
  optionLabels,
  options,
  selectedOption,
}: {
  label: string;
  onChangeSelectedOption: (selectedOption: TOption) => void;
  optionLabels: Record<TOption, string>;
  options: readonly TOption[];
  selectedOption: TOption;
}) {
  return (
    <>
      <Text>{label}</Text>
      <Host matchContents>
        <Picker
          onValueChange={onChangeSelectedOption}
          selectedValue={selectedOption}
          testID={label}
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
