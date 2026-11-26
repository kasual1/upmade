import { darkTheme, UpmadeTheme } from "@upmade/angular-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const angularThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: 'dark',
  global: {
    ...darkTheme.global,
    primaryColor: '#dd5f9e',
    primaryHoverColor: '#c7568e',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(221, 95, 158, 0.3)',
  },
  button: {
    ...darkTheme.button,
    primaryBackgroundColor: '#dd5f9e',
    primaryHoverBackgroundColor: '#c7568e',
    primaryActiveBackgroundColor: '#b14c7e',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#dd5f9e',
    logoutButtonHoverBackgroundColor: '#c7568e',
    logoutButtonActiveBackgroundColor: '#b14c7e',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...darkTheme.selection,
    borderColor: '#dd5f9e',
    boxBackgroundColor: 'rgba(221, 95, 158, 0.15)',
    boxBorderColor: 'rgba(221, 95, 158, 0.4)',
    handleStrokeColor: '#dd5f9e',
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlSelectedBackgroundColor: '#dd5f9e',
  },
  menu: {
    ...darkTheme.menu,
    itemSelectedBackgroundColor: '#dd5f9e',
    itemInputSelectionColor: '#dd5f9e',
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: '#dd5f9e',
    indicatorStrokeInactive: 'rgba(255, 255, 255, 0.45)',
    indicatorFill: 'rgba(221, 95, 158, 0.35)',
    indicatorFillInactive: 'rgba(221, 95, 158, 0.2)',
    lineStroke: 'rgba(221, 95, 158, 0.28)',
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: '#dd5f9e',
    selectedBackgroundColor: 'rgba(221, 95, 158, 0.15)',
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: '#dd5f9e',
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: '#dd5f9e',
    thumbBorderColor: '#dd5f9e',
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemSelectedBackgroundColor: '#dd5f9e',
    menuItemSelectedHoverBackgroundColor: '#dd5f9e',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: '#dd5f9e',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: '#dd5f9e',
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: '#dd5f9e',
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: '#4b293a',
    activeButtonFilledBackgroundColor: '#dd5f9e',
    activeIconColor: '#dd5f9e',
    activeMutedTextColor: 'rgba(221, 95, 158, 0.6)',
    activeTextColor: '#dd5f9e',
    focusRing: '2px solid #dd5f9e',
    selectionBackgroundColor: '#dd5f9e',
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: '#dd5f9e',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#c7568e',
    caretColor: '#dd5f9e',
    selectionBackgroundColor: '#dd5f9e',
    selectionColor: '#ffffff',
  },
}, darkStyle);
