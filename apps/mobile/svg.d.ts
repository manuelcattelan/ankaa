// react-native-svg-transformer turns each .svg file into a react-native-svg
// component, so TypeScript reads an .svg import as one
// (https://github.com/kristerkari/react-native-svg-transformer#using-typescript).
declare module "*.svg" {
  import type { ComponentType } from "react";
  import type { SvgProps } from "react-native-svg";

  const svgComponent: ComponentType<SvgProps>;
  export default svgComponent;
}
