import { lightTheme, type UpmadeTheme } from "@upmade/vue-editor";
import { lightStyle, withDemoStyle } from "./demo-style";

export const vueThemeLight: UpmadeTheme = withDemoStyle({
  ...lightTheme,
  name: 'light',
  global: {
    ...lightTheme.global,
    primaryColor: '#4ade80',
    primaryHoverColor: '#43c873',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(74, 222, 128, 0.2)',
  },
  button: {
    ...lightTheme.button,
    primaryBackgroundColor: '#4ade80',
    primaryHoverBackgroundColor: '#43c873',
    primaryActiveBackgroundColor: '#3bb266',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...lightTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#4ade80',
    logoutButtonHoverBackgroundColor: '#43c873',
    logoutButtonActiveBackgroundColor: '#3bb266',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...lightTheme.selection,
    borderColor: '#4ade80',
    handleStrokeColor: '#4ade80',
    boxBackgroundColor: 'rgba(74, 222, 128, 0.2)',
    boxBorderColor: 'rgba(74, 222, 128, 0.5)',
  },
  toolbar: {
    ...lightTheme.toolbar,
    controlSelectedBackgroundColor: '#4ade80',
  },
  menu: {
    ...lightTheme.menu,
    itemSelectedBackgroundColor: '#4ade80',
    itemInputSelectionColor: '#4ade80',
  },
  snap: {
    ...lightTheme.snap,
    indicatorStroke: '#4ade80',
    indicatorStrokeInactive: 'rgba(74, 222, 128, 0.5)',
    indicatorFill: 'rgba(74, 222, 128, 0.16)',
    indicatorFillInactive: 'rgba(74, 222, 128, 0.1)',
    lineStroke: 'rgba(74, 222, 128, 0.24)',
  },
  dropdown: {
    ...lightTheme.dropdown,
    accentColor: '#4ade80',
    selectedBackgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  slideToggle: {
    ...lightTheme.slideToggle,
    trackCheckedColor: '#4ade80',
  },
  opacitySlider: {
    ...lightTheme.opacitySlider,
    activeColor: '#4ade80',
    thumbBorderColor: '#4ade80',
  },
  masterDetail: {
    ...lightTheme.masterDetail,
    menuItemSelectedBackgroundColor: '#4ade80',
    menuItemSelectedHoverBackgroundColor: '#4ade80',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...lightTheme.text,
    selectionBackgroundColor: '#4ade80',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...lightTheme.textInput,
    focusBorderColor: '#4ade80',
  },
  numericInput: {
    ...lightTheme.numericInput,
    focusBorderColor: '#4ade80',
  },
  titlebar: {
    ...lightTheme.titlebar,
    activeBackgroundColor: '#e9fbf0',
    activeButtonFilledBackgroundColor: '#4ade80',
    activeIconColor: '#4ade80',
    activeMutedTextColor: 'rgba(74, 222, 128, 0.6)',
    activeTextColor: '#4ade80',
    focusRing: '2px solid #4ade80',
    selectionBackgroundColor: '#4ade80',
  },
  chatBox: {
    ...lightTheme.chatBox,
    buttonBackgroundColor: '#4ade80',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#43c873',
    caretColor: '#4ade80',
    selectionBackgroundColor: '#4ade80',
    selectionColor: '#ffffff',
  },
}, lightStyle);
