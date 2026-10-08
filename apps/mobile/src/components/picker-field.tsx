import type { PickerItemValue } from "@expo/ui";

import { Host, Picker } from "@expo/ui";

import { Text } from "@/components/text";

type PickerFieldProperties<TPickerValue extends PickerItemValue> = {
  label: string;
  onChangeSelectedValue: (selectedValue: TPickerValue) => void;
  optionLabels: Record<TPickerValue, string>;
  options: readonly TPickerValue[];
  selectedValue: TPickerValue;
};

export function PickerField<TPickerValue extends PickerItemValue>({
  label,
  onChangeSelectedValue,
  optionLabels,
  options,
  selectedValue,
}: PickerFieldProperties<TPickerValue>) {
  return (
    <>
      <Text>{label}</Text>
      <Host matchContents>
        <Picker
          onValueChange={onChangeSelectedValue}
          selectedValue={selectedValue}
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
