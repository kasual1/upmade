import { UpmadeTheme } from "@upmade/react-editor";
import { lightStyle, withDemoStyle } from "./demo-style";

export const reactThemeLight: UpmadeTheme = withDemoStyle({
  name: 'light',
  global: {
    primaryColor: '#056bb4',
    primaryHoverColor: '#04599a',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(111, 195, 255, 0.4)',
    cursorTrailColor: 'rgb(228, 228, 228)',
    cursorTrailOpacity: '0.6',
    textPrimary: '#000000',
  },
  engine: {
    backgroundColor: '#ffffff',
  },
  selection: {
    borderColor: '#056bb4',
    borderWidth: '2px',
    handleSize: '6px',
    handleColor: '#ffffff',
    handleStrokeColor: '#056bb4',
    boxBackgroundColor: 'rgba(111, 195, 255, 0.25)',
    boxBorderColor: 'rgba(111, 195, 255, 0.7)',
  },
  contextMenu: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12)',
    border: '1px solid #ebebeb',
    padding: '4px',
    itemGap: '8px',
    itemPadding: '8px',
    itemBorderRadius: '12px',
    itemColor: '#333333',
    itemFontSize: '14px',
    itemHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    itemActiveBackgroundColor: 'rgba(111, 195, 255, 0.24)',
    itemDisabledColor: '#aaaaaa',
  },
  toolbar: {
    boxShadow: '0 0 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #ebebeb',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    padding: '8px',
    gap: '8px',
    controlColor: '#000',
    controlBorderRadius: '12px',
    controlPadding: '8px',
    controlHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    controlActiveBackgroundColor: 'rgba(111, 195, 255, 0.24)',
    controlSelectedBackgroundColor: '#056bb4',
    controlSelectedColor: '#ffffff',
    separatorColor: '#ebebeb'
  },
  tooltip: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '16px',
    padding: '8px',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12)',
  },
  colorPalette: {
    hoverBackgroundColor: '#ebebeb',
    circleBorderColor: '#dddcdc',
    selectedBackgroundColor: '#ebebeb',
  },
  strokeSize: {
    hoverBackgroundColor: '#ebebeb',
    selectedBackgroundColor: '#ebebeb',
  },
  menu: {
    itemButtonHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    itemOverlayBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    itemSelectedBackgroundColor: '#056bb4',
    itemInputSelectionColor: '#056bb4',
  },
  snap: {
    indicatorStroke: '#056bb4',
    indicatorStrokeInactive: 'rgba(111, 195, 255, 0.7)',
    indicatorFill: 'rgba(111, 195, 255, 0.36)',
    indicatorFillInactive: 'rgba(111, 195, 255, 0.24)',
    lineStroke: 'rgba(111, 195, 255, 0.4)',
  },
  splitButton: {
    hoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
  },
  dropdown: {
    accentColor: '#056bb4',
    selectedBackgroundColor: 'rgba(111, 195, 255, 0.2)',
  },
  button: {
    primaryBackgroundColor: '#056bb4',
    primaryHoverBackgroundColor: '#04599a',
    primaryActiveBackgroundColor: '#034a80',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    logoutButtonBackgroundColor: '#056bb4',
    logoutButtonHoverBackgroundColor: '#04599a',
    logoutButtonActiveBackgroundColor: '#034a80',
    logoutButtonColor: '#ffffff',
  },
  slideToggle: {
    trackCheckedColor: '#056bb4',
  },
  loginDialog: {
    buttonHoverBackground: 'rgba(111, 195, 255, 0.16)',
  },
  opacitySlider: {
    activeColor: '#056bb4',
    thumbColor: '#056bb4',
  },
  moreMenu: {
    buttonHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    buttonActiveBackgroundColor: 'rgba(111, 195, 255, 0.24)',
  },
  masterDetail: {
    menuItemHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    menuItemActiveBackgroundColor: 'rgba(111, 195, 255, 0.24)',
    menuItemSelectedBackgroundColor: 'rgba(111, 195, 255, 0.2)',
    menuItemSelectedHoverBackgroundColor: 'rgba(111, 195, 255, 0.3)',
    menuItemSelectedColor: '#056bb4',
  },
  text: {
    selectionBackgroundColor: '#056bb4',
    selectionColor: '#ffffff',
  },
  textInput: {
    focusBorderColor: '#056bb4',
  },
  numericInput: {
    focusBorderColor: '#056bb4',
  },
  titlebar: {
    activeBackgroundColor: '#e8f5ff',
    activeButtonFilledBackgroundColor: '#056bb4',
    activeIconColor: '#056bb4',
    activeMutedTextColor: 'rgba(5, 107, 180, 0.6)',
    activeTextColor: '#056bb4',
    buttonHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
    buttonPressedBackgroundColor: 'rgba(111, 195, 255, 0.24)',
    focusRing: '2px solid #056bb4',
    selectionBackgroundColor: '#056bb4',
  },
  titlebarMenu: {
    itemHoverBackgroundColor: 'rgba(111, 195, 255, 0.16)',
  },
  chatBox: {
    buttonBackgroundColor: '#056bb4',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#04599a',
    caretColor: '#056bb4',
    selectionBackgroundColor: '#056bb4',
    selectionColor: '#ffffff',
  },
}, lightStyle);
