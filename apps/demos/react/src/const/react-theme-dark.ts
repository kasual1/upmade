import { darkTheme, UpmadeTheme } from "@upmade/react-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const reactThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: 'dark',
  global: {
    ...darkTheme.global,
    primaryColor: '#63aadd',
    primaryHoverColor: '#5999c7',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(99, 170, 221, 0.3)',
  },
  button: {
    ...darkTheme.button,
    primaryBackgroundColor: '#63aadd',
    primaryHoverBackgroundColor: '#5999c7',
    primaryActiveBackgroundColor: '#4f88b1',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#63aadd',
    logoutButtonHoverBackgroundColor: '#5999c7',
    logoutButtonActiveBackgroundColor: '#4f88b1',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...darkTheme.selection,
    borderColor: '#63aadd',
    boxBackgroundColor: 'rgba(99, 170, 221, 0.15)',
    boxBorderColor: 'rgba(99, 170, 221, 0.4)',
    handleStrokeColor: '#63aadd',
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlSelectedBackgroundColor: '#63aadd',
  },
  menu: {
    ...darkTheme.menu,
    itemSelectedBackgroundColor: '#63aadd',
    itemInputSelectionColor: '#63aadd',
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: '#63aadd',
    indicatorStrokeInactive: 'rgba(255, 255, 255, 0.45)',
    indicatorFill: 'rgba(99, 170, 221, 0.35)',
    indicatorFillInactive: 'rgba(99, 170, 221, 0.2)',
    lineStroke: 'rgba(99, 170, 221, 0.28)',
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: '#63aadd',
    selectedBackgroundColor: 'rgba(99, 170, 221, 0.15)',
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: '#63aadd',
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: '#63aadd',
    thumbBorderColor: '#63aadd',
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemSelectedBackgroundColor: '#63aadd',
    menuItemSelectedHoverBackgroundColor: '#63aadd',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: '#63aadd',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: '#63aadd',
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: '#63aadd',
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: '#2a3d4b',
    activeButtonFilledBackgroundColor: '#63aadd',
    activeIconColor: '#63aadd',
    activeMutedTextColor: 'rgba(99, 170, 221, 0.6)',
    activeTextColor: '#63aadd',
    focusRing: '2px solid #63aadd',
    selectionBackgroundColor: '#63aadd',
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: '#63aadd',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#5999c7',
    caretColor: '#63aadd',
    selectionBackgroundColor: '#63aadd',
    selectionColor: '#ffffff',
  },
}, darkStyle);
