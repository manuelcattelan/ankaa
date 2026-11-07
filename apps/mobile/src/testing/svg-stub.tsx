/**
 * Stands in for every `.svg` file in Jest, through `moduleNameMapper`,
 * because Jest runs no Metro transformer to turn the file into a component.
 * It renders nothing.
 */
export default function SvgStub() {
  return null;
}
