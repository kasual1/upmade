import { lightTheme, UpmadeTheme } from "@upmade/react-editor";
import { lightStyle, withDemoStyle } from "./demo-style";

export const reactThemeLight: UpmadeTheme = withDemoStyle({
  ...lightTheme,
  name: 'light',
  global: {
    ...lightTheme.global,
    primaryColor: '#6fc3ff',
    primaryHoverColor: '#64b0e6',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(111, 195, 255, 0.2)',
  },
  button: {
    ...lightTheme.button,
    primaryBackgroundColor: '#6fc3ff',
    primaryHoverBackgroundColor: '#64b0e6',
    primaryActiveBackgroundColor: '#599ccc',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...lightTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#6fc3ff',
    logoutButtonHoverBackgroundColor: '#64b0e6',
    logoutButtonActiveBackgroundColor: '#599ccc',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...lightTheme.selection,
    borderColor: '#6fc3ff',
    handleStrokeColor: '#6fc3ff',
    boxBackgroundColor: 'rgba(111, 195, 255, 0.2)',
    boxBorderColor: 'rgba(111, 195, 255, 0.5)',
  },
  toolbar: {
    ...lightTheme.toolbar,
    controlSelectedBackgroundColor: '#6fc3ff',
  },
  menu: {
    ...lightTheme.menu,
    itemSelectedBackgroundColor: '#6fc3ff',
    itemInputSelectionColor: '#6fc3ff',
  },
  snap: {
    ...lightTheme.snap,
    indicatorStroke: '#6fc3ff',
    indicatorStrokeInactive: 'rgba(111, 195, 255, 0.5)',
    indicatorFill: 'rgba(111, 195, 255, 0.16)',
    indicatorFillInactive: 'rgba(111, 195, 255, 0.1)',
    lineStroke: 'rgba(111, 195, 255, 0.24)',
  },
  dropdown: {
    ...lightTheme.dropdown,
    accentColor: '#6fc3ff',
    selectedBackgroundColor: 'rgba(111, 195, 255, 0.1)',
  },
  slideToggle: {
    ...lightTheme.slideToggle,
    trackCheckedColor: '#6fc3ff',
  },
  opacitySlider: {
    ...lightTheme.opacitySlider,
    activeColor: '#6fc3ff',
    thumbBorderColor: '#6fc3ff',
  },
  masterDetail: {
    ...lightTheme.masterDetail,
    menuItemSelectedBackgroundColor: '#6fc3ff',
    menuItemSelectedHoverBackgroundColor: '#6fc3ff',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...lightTheme.text,
    selectionBackgroundColor: '#6fc3ff',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...lightTheme.textInput,
    focusBorderColor: '#6fc3ff',
  },
  numericInput: {
    ...lightTheme.numericInput,
    focusBorderColor: '#6fc3ff',
  },
  titlebar: {
    ...lightTheme.titlebar,
    activeBackgroundColor: '#eef8ff',
    activeButtonFilledBackgroundColor: '#6fc3ff',
    activeIconColor: '#6fc3ff',
    activeMutedTextColor: 'rgba(111, 195, 255, 0.6)',
    activeTextColor: '#6fc3ff',
    focusRing: '2px solid #6fc3ff',
    selectionBackgroundColor: '#6fc3ff',
  },
  chatBox: {
    ...lightTheme.chatBox,
    buttonBackgroundColor: '#6fc3ff',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#64b0e6',
    caretColor: '#6fc3ff',
    selectionBackgroundColor: '#6fc3ff',
    selectionColor: '#ffffff',
  },
}, lightStyle);
