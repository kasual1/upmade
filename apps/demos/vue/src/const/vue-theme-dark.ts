import { darkTheme, type UpmadeTheme } from "@upmade/vue-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const vueThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: 'dark',
  global: {
    ...darkTheme.global,
    primaryColor: '#43c171',
    primaryHoverColor: '#3cae66',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(67, 193, 113, 0.3)',
  },
  button: {
    ...darkTheme.button,
    primaryBackgroundColor: '#43c171',
    primaryHoverBackgroundColor: '#3cae66',
    primaryActiveBackgroundColor: '#369a5a',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#43c171',
    logoutButtonHoverBackgroundColor: '#3cae66',
    logoutButtonActiveBackgroundColor: '#369a5a',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...darkTheme.selection,
    borderColor: '#43c171',
    boxBackgroundColor: 'rgba(67, 193, 113, 0.15)',
    boxBorderColor: 'rgba(67, 193, 113, 0.4)',
    handleStrokeColor: '#43c171',
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlSelectedBackgroundColor: '#43c171',
  },
  menu: {
    ...darkTheme.menu,
    itemSelectedBackgroundColor: '#43c171',
    itemInputSelectionColor: '#43c171',
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: '#43c171',
    indicatorStrokeInactive: 'rgba(255, 255, 255, 0.45)',
    indicatorFill: 'rgba(67, 193, 113, 0.35)',
    indicatorFillInactive: 'rgba(67, 193, 113, 0.2)',
    lineStroke: 'rgba(67, 193, 113, 0.28)',
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: '#43c171',
    selectedBackgroundColor: 'rgba(67, 193, 113, 0.15)',
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: '#43c171',
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: '#43c171',
    thumbBorderColor: '#43c171',
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemSelectedBackgroundColor: '#43c171',
    menuItemSelectedHoverBackgroundColor: '#43c171',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: '#43c171',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: '#43c171',
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: '#43c171',
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: '#21432e',
    activeButtonFilledBackgroundColor: '#43c171',
    activeIconColor: '#43c171',
    activeMutedTextColor: 'rgba(67, 193, 113, 0.6)',
    activeTextColor: '#43c171',
    focusRing: '2px solid #43c171',
    selectionBackgroundColor: '#43c171',
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: '#43c171',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#3cae66',
    caretColor: '#43c171',
    selectionBackgroundColor: '#43c171',
    selectionColor: '#ffffff',
  },
}, darkStyle);
