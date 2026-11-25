import { darkTheme, type UpmadeTheme } from "@upmade/vue-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const vueThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: 'dark',
  global: {
    ...darkTheme.global,
    focusRingColor: 'rgba(74, 222, 128, 0.3)',
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#19793c',
    logoutButtonHoverBackgroundColor: '#146533',
    logoutButtonActiveBackgroundColor: '#10522a',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...darkTheme.selection,
    borderColor: '#19793c',
    boxBackgroundColor: 'rgba(74, 222, 128, 0.15)',
    boxBorderColor: 'rgba(74, 222, 128, 0.4)',
    handleStrokeColor: '#19793c',
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    controlActiveBackgroundColor: 'rgba(74, 222, 128, 0.18)',
    controlSelectedBackgroundColor: '#19793c',
  },
  contextMenu: {
    ...darkTheme.contextMenu,
    itemHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    itemActiveBackgroundColor: 'rgba(74, 222, 128, 0.18)',
  },
  menu: {
    ...darkTheme.menu,
    itemButtonHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    itemOverlayBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    itemSelectedBackgroundColor: '#19793c',
    itemInputSelectionColor: '#19793c',
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: '#19793c',
    indicatorStrokeInactive: 'rgba(255, 255, 255, 0.45)',
    indicatorFill: 'rgba(74, 222, 128, 0.35)',
    indicatorFillInactive: 'rgba(74, 222, 128, 0.2)',
    lineStroke: 'rgba(74, 222, 128, 0.28)',
  },
  splitButton: {
    ...darkTheme.splitButton,
    hoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: '#4ade80',
    selectedBackgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: '#19793c',
  },
  loginDialog: {
    ...darkTheme.loginDialog,
    buttonHoverBackground: 'rgba(74, 222, 128, 0.12)',
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: '#19793c',
    thumbBorderColor: '#19793c',
  },
  moreMenu: {
    ...darkTheme.moreMenu,
    buttonHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    buttonActiveBackgroundColor: 'rgba(74, 222, 128, 0.18)',
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    menuItemActiveBackgroundColor: 'rgba(74, 222, 128, 0.18)',
    menuItemSelectedBackgroundColor: '#19793c',
    menuItemSelectedHoverBackgroundColor: '#19793c',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: '#19793c',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: '#4ade80',
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: '#4ade80',
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: '#294a35',
    activeButtonFilledBackgroundColor: '#19793c',
    activeIconColor: '#4ade80',
    activeMutedTextColor: 'rgba(74, 222, 128, 0.6)',
    activeTextColor: '#4ade80',
    buttonHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
    buttonPressedBackgroundColor: 'rgba(74, 222, 128, 0.18)',
    focusRing: '2px solid #4ade80',
    selectionBackgroundColor: '#19793c',
  },
  titlebarMenu: {
    ...darkTheme.titlebarMenu,
    itemHoverBackgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: '#19793c',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#146533',
    caretColor: '#4ade80',
    selectionBackgroundColor: '#19793c',
    selectionColor: '#ffffff',
  },
}, darkStyle);
