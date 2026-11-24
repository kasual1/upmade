// Moved to the landing kit (plan M6b). This shim renders it with the legacy classes and symbols so the legacy "/"
// (Hero, DomCanvasDemo) looks as before, until M10.
import Calculator, {
  type CalculatorClassNames,
  type CalculatorProps,
  type CalculatorSymbols,
} from "../LandingPage/media/DomCanvas/Calculator";
import styles from "./styles.module.css";

const LEGACY_CLASS_NAMES: CalculatorClassNames = {
  root: styles.calculator,
  header: styles.calculatorHeader,
  display: styles.calculatorDisplay,
  keypad: styles.calculatorKeypad,
  operatorKey: styles.calculatorOperator,
  equalsKey: styles.calculatorEquals,
  zeroKey: styles.calculatorZero,
};

const LEGACY_SYMBOLS: CalculatorSymbols = { "/": "/", "*": "x", "-": "-", "+": "+" };

export default function LegacyCalculator(props: Pick<CalculatorProps, "state" | "dispatch">) {
  return <Calculator {...props} classNames={LEGACY_CLASS_NAMES} symbols={LEGACY_SYMBOLS} label="Calculator" />;
}
