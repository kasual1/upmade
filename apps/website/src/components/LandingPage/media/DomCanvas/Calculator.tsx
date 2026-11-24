import { useReducer, useRef, type Dispatch, type ReactNode } from "react";
import {
  calculatorReducer,
  INITIAL_CALCULATOR_STATE,
  type CalculatorAction,
  type CalculatorOperator,
  type CalculatorState,
} from "./calculator-state";
import styles from "./Calculator.module.css";

/** The classes of each part. Parts without a class render without a class attribute. */
export interface CalculatorClassNames {
  root?: string;
  header?: string;
  title?: string;
  /** the pending operator shown in the header */
  pending?: string;
  display?: string;
  /** added to the display (and restarted) on "=" and "C"; leave out for no bump */
  displayBump?: string;
  keypad?: string;
  key?: string;
  clearKey?: string;
  operatorKey?: string;
  equalsKey?: string;
  zeroKey?: string;
}

/** How each operator is written on its key and in the header. */
export type CalculatorSymbols = Readonly<Record<CalculatorOperator, string>>;

/** The art style of the landing kit (the design's .dom-calc). */
const ART_CLASS_NAMES: CalculatorClassNames = {
  root: styles.root,
  header: styles.header,
  title: styles.title,
  pending: styles.pending,
  display: styles.display,
  displayBump: styles.bump,
  keypad: styles.keypad,
  key: styles.key,
  clearKey: styles.clear,
  operatorKey: styles.operator,
  equalsKey: styles.equals,
  zeroKey: styles.zero,
};

const TYPESET_SYMBOLS: CalculatorSymbols = { "/": "÷", "*": "×", "-": "−", "+": "+" };

const OPERATORS: ReadonlyArray<{ value: CalculatorOperator; name: string }> = [
  { value: "/", name: "Divide" },
  { value: "*", name: "Multiply" },
  { value: "-", name: "Subtract" },
  { value: "+", name: "Add" },
];

/** Joins classes; undefined (no attribute) when there are none, so unstyled parts render exactly as before. */
function cx(...names: Array<string | undefined>): string | undefined {
  const joined = names.filter(Boolean).join(" ");
  return joined || undefined;
}

export interface CalculatorProps {
  /** Pass both to control the calculator from outside, e.g. to mirror its state elsewhere. */
  state?: CalculatorState;
  dispatch?: Dispatch<CalculatorAction>;
  /** the classes of its parts; the landing kit's art style by default */
  classNames?: CalculatorClassNames;
  /** the operator symbols; typeset (÷ × − +) by default */
  symbols?: CalculatorSymbols;
  /** the accessible name of the calculator */
  label?: string;
}

/**
 * A working four-function calculator (calculator-state.ts). Moved here from Landing/ (plan M6b): the art style is
 * the default; Landing/Calculator.tsx passes the legacy classes and symbols so the legacy "/" renders as before.
 */
export default function Calculator({
  state: outerState,
  dispatch: outerDispatch,
  classNames = ART_CLASS_NAMES,
  symbols = TYPESET_SYMBOLS,
  label = "Calculator",
}: CalculatorProps): ReactNode {
  const [ownState, ownDispatch] = useReducer(calculatorReducer, INITIAL_CALCULATOR_STATE);
  const state = outerState ?? ownState;
  const dispatch = outerDispatch ?? ownDispatch;
  const c = classNames;
  const displayRef = useRef<HTMLOutputElement>(null);

  // restart the display's bump (a class React does not manage: the display's className never changes)
  const bump = () => {
    const display = displayRef.current;
    if (!display || !c.displayBump) return;
    display.classList.remove(c.displayBump);
    void display.offsetWidth;
    display.classList.add(c.displayBump);
  };

  const digit = (value: string) => (
    <button key={value} type="button" className={c.key} onClick={() => dispatch({ type: "digit", digit: value })}>
      {value}
    </button>
  );
  const operator = (index: number) => {
    const { value, name } = OPERATORS[index];
    return (
      <button
        type="button"
        className={cx(c.key, c.operatorKey)}
        aria-label={name}
        onClick={() => dispatch({ type: "operator", operator: value })}
      >
        {symbols[value]}
      </button>
    );
  };

  return (
    <section className={c.root} aria-label={label}>
      <header className={c.header}>
        <span className={c.title}>Calculator</span>
        <span className={c.pending}>{state.operator && symbols[state.operator]}</span>
      </header>
      <output ref={displayRef} className={c.display} aria-label="Result" aria-live="polite">
        {state.display}
      </output>
      <div className={c.keypad}>
        <button
          type="button"
          className={cx(c.key, c.clearKey)}
          aria-label="Clear"
          onClick={() => {
            dispatch({ type: "clear" });
            bump();
          }}
        >
          C
        </button>
        {operator(0)}
        {operator(1)}
        {operator(2)}
        {["7", "8", "9"].map(digit)}
        {operator(3)}
        {["4", "5", "6"].map(digit)}
        <button
          type="button"
          className={cx(c.key, c.equalsKey)}
          aria-label="Equals"
          onClick={() => {
            dispatch({ type: "equals" });
            bump();
          }}
        >
          =
        </button>
        {["1", "2", "3"].map(digit)}
        <button type="button" className={cx(c.key, c.zeroKey)} onClick={() => dispatch({ type: "digit", digit: "0" })}>
          0
        </button>
        <button type="button" className={c.key} aria-label="Decimal point" onClick={() => dispatch({ type: "decimal" })}>
          .
        </button>
      </div>
    </section>
  );
}
