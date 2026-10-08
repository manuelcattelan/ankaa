import { Checkbox, Column, Host } from "@expo/ui";

import { Text } from "@/components/text";

type CheckboxGroupProperties<TOption extends string> = {
  label: string;
  onChangeSelectedOptions: (selectedOptions: TOption[]) => void;
  optionLabels: Record<TOption, string>;
  options: readonly TOption[];
  selectedOptions: TOption[];
};

export function CheckboxGroup<TOption extends string>({
  label,
  onChangeSelectedOptions,
  optionLabels,
  options,
  selectedOptions,
}: CheckboxGroupProperties<TOption>) {
  function handleToggleOption(option: TOption) {
    onChangeSelectedOptions(
      selectedOptions.includes(option)
        ? selectedOptions.filter((selectedOption) => selectedOption !== option)
        : [...selectedOptions, option],
    );
  }

  return (
    <>
      <Text>{label}</Text>
      <Host matchContents>
        <Column>
          {options.map((option) => (
            <Checkbox
              key={option}
              label={optionLabels[option]}
              onValueChange={() => {
                handleToggleOption(option);
              }}
              value={selectedOptions.includes(option)}
            />
          ))}
        </Column>
      </Host>
    </>
  );
}
