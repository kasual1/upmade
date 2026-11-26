import { lightTheme, UpmadeTheme } from "@upmade/angular-editor";
import { lightStyle, withDemoStyle } from "./demo-style";

export const angularThemeLight: UpmadeTheme = withDemoStyle({
  ...lightTheme,
  name: 'light',
  global: {
    ...lightTheme.global,
    primaryColor: '#ff6ab5',
    primaryHoverColor: '#e65fa3',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(255, 106, 181, 0.2)',
  },
  button: {
    ...lightTheme.button,
    primaryBackgroundColor: '#ff6ab5',
    primaryHoverBackgroundColor: '#e65fa3',
    primaryActiveBackgroundColor: '#cc5591',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...lightTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#ff6ab5',
    logoutButtonHoverBackgroundColor: '#e65fa3',
    logoutButtonActiveBackgroundColor: '#cc5591',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...lightTheme.selection,
    borderColor: '#ff6ab5',
    handleStrokeColor: '#ff6ab5',
    boxBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    boxBorderColor: 'rgba(255, 106, 181, 0.5)',
  },
  toolbar: {
    ...lightTheme.toolbar,
    controlSelectedBackgroundColor: '#ff6ab5',
  },
  menu: {
    ...lightTheme.menu,
    itemSelectedBackgroundColor: '#ff6ab5',
    itemInputSelectionColor: '#ff6ab5',
  },
  snap: {
    ...lightTheme.snap,
    indicatorStroke: '#ff6ab5',
    indicatorStrokeInactive: 'rgba(255, 106, 181, 0.5)',
    indicatorFill: 'rgba(255, 106, 181, 0.16)',
    indicatorFillInactive: 'rgba(255, 106, 181, 0.1)',
    lineStroke: 'rgba(255, 106, 181, 0.24)',
  },
  dropdown: {
    ...lightTheme.dropdown,
    accentColor: '#ff6ab5',
    selectedBackgroundColor: 'rgba(255, 106, 181, 0.1)',
  },
  slideToggle: {
    ...lightTheme.slideToggle,
    trackCheckedColor: '#ff6ab5',
  },
  opacitySlider: {
    ...lightTheme.opacitySlider,
    activeColor: '#ff6ab5',
    thumbBorderColor: '#ff6ab5',
  },
  masterDetail: {
    ...lightTheme.masterDetail,
    menuItemSelectedBackgroundColor: '#ff6ab5',
    menuItemSelectedHoverBackgroundColor: '#ff6ab5',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...lightTheme.text,
    selectionBackgroundColor: '#ff6ab5',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...lightTheme.textInput,
    focusBorderColor: '#ff6ab5',
  },
  numericInput: {
    ...lightTheme.numericInput,
    focusBorderColor: '#ff6ab5',
  },
  titlebar: {
    ...lightTheme.titlebar,
    activeBackgroundColor: '#ffedf6',
    activeButtonFilledBackgroundColor: '#ff6ab5',
    activeIconColor: '#ff6ab5',
    activeMutedTextColor: 'rgba(255, 106, 181, 0.6)',
    activeTextColor: '#ff6ab5',
    focusRing: '2px solid #ff6ab5',
    selectionBackgroundColor: '#ff6ab5',
  },
  chatBox: {
    ...lightTheme.chatBox,
    buttonBackgroundColor: '#ff6ab5',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#e65fa3',
    caretColor: '#ff6ab5',
    selectionBackgroundColor: '#ff6ab5',
    selectionColor: '#ffffff',
  },
}, lightStyle);
