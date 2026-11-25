import type { UpmadeTheme } from "@upmade/vue-editor";
import { lightStyle, withDemoStyle } from "./demo-style";

export const vueThemeLight: UpmadeTheme = withDemoStyle({
  name: 'light',
  global: {
    primaryColor: '#19793c',
    primaryHoverColor: '#146533',
    focusRingColor: 'rgba(74, 222, 128, 0.4)',
    cursorTrailColor: 'rgb(228, 228, 228)',
    cursorTrailOpacity: '0.6',
    textPrimary: '#000000',
  },
  engine: {
    backgroundColor: '#ffffff',
  },
  selection: {
    borderColor: '#19793c',
    borderWidth: '2px',
    handleSize: '6px',
    handleColor: '#ffffff',
    handleStrokeColor: '#19793c',
    boxBackgroundColor: 'rgba(74, 222, 128, 0.25)',
    boxBorderColor: 'rgba(74, 222, 128, 0.7)',
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
    itemHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    itemActiveBackgroundColor: 'rgba(74, 222, 128, 0.24)',
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
    controlHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    controlActiveBackgroundColor: 'rgba(74, 222, 128, 0.24)',
    controlSelectedBackgroundColor: '#19793c',
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
    itemButtonHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    itemOverlayBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    itemSelectedBackgroundColor: '#19793c',
    itemInputSelectionColor: '#19793c',
  },
  snap: {
    indicatorStroke: '#19793c',
    indicatorStrokeInactive: 'rgba(74, 222, 128, 0.7)',
    indicatorFill: 'rgba(74, 222, 128, 0.36)',
    indicatorFillInactive: 'rgba(74, 222, 128, 0.24)',
    lineStroke: 'rgba(74, 222, 128, 0.4)',
  },
  splitButton: {
    hoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
  },
  dropdown: {
    accentColor: '#19793c',
    selectedBackgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  button: {
    primaryBackgroundColor: '#19793c',
    primaryHoverBackgroundColor: '#146533',
    primaryActiveBackgroundColor: '#10522a',
  },
  currentUserDialog: {
    logoutButtonBackgroundColor: '#19793c',
    logoutButtonHoverBackgroundColor: '#146533',
    logoutButtonActiveBackgroundColor: '#10522a',
    logoutButtonColor: '#ffffff',
  },
  slideToggle: {
    trackCheckedColor: '#19793c',
  },
  loginDialog: {
    buttonHoverBackground: 'rgba(74, 222, 128, 0.16)',
  },
  opacitySlider: {
    activeColor: '#19793c',
    thumbColor: '#19793c',
  },
  moreMenu: {
    buttonHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    buttonActiveBackgroundColor: 'rgba(74, 222, 128, 0.24)',
  },
  masterDetail: {
    menuItemHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    menuItemActiveBackgroundColor: 'rgba(74, 222, 128, 0.24)',
    menuItemSelectedBackgroundColor: 'rgba(74, 222, 128, 0.2)',
    menuItemSelectedHoverBackgroundColor: 'rgba(74, 222, 128, 0.3)',
    menuItemSelectedColor: '#19793c',
  },
  text: {
    selectionBackgroundColor: '#19793c',
    selectionColor: '#ffffff',
  },
  textInput: {
    focusBorderColor: '#19793c',
  },
  numericInput: {
    focusBorderColor: '#19793c',
  },
  titlebar: {
    activeBackgroundColor: '#e2faeb',
    activeButtonFilledBackgroundColor: '#19793c',
    activeIconColor: '#19793c',
    activeMutedTextColor: 'rgba(25, 121, 60, 0.6)',
    activeTextColor: '#19793c',
    buttonHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
    buttonPressedBackgroundColor: 'rgba(74, 222, 128, 0.24)',
    focusRing: '2px solid #19793c',
    selectionBackgroundColor: '#19793c',
  },
  titlebarMenu: {
    itemHoverBackgroundColor: 'rgba(74, 222, 128, 0.16)',
  },
  chatBox: {
    buttonBackgroundColor: '#19793c',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#146533',
    caretColor: '#19793c',
    selectionBackgroundColor: '#19793c',
    selectionColor: '#ffffff',
  },
}, lightStyle);
