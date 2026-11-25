import { darkTheme, UpmadeTheme } from "@upmade/angular-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const angularThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: 'dark',
  global: {
    ...darkTheme.global,
    primaryColor: '#c10564',
    primaryHoverColor: '#a30455',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(255, 106, 181, 0.3)',
  },
  button: {
    ...darkTheme.button,
    primaryBackgroundColor: '#c10564',
    primaryHoverBackgroundColor: '#a30455',
    primaryActiveBackgroundColor: '#86034a',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#c10564',
    logoutButtonHoverBackgroundColor: '#a30455',
    logoutButtonActiveBackgroundColor: '#86034a',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...darkTheme.selection,
    borderColor: '#c10564',
    boxBackgroundColor: 'rgba(255, 106, 181, 0.15)',
    boxBorderColor: 'rgba(255, 106, 181, 0.4)',
    handleStrokeColor: '#c10564',
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    controlActiveBackgroundColor: 'rgba(255, 106, 181, 0.18)',
    controlSelectedBackgroundColor: '#c10564',
  },
  contextMenu: {
    ...darkTheme.contextMenu,
    itemHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    itemActiveBackgroundColor: 'rgba(255, 106, 181, 0.18)',
  },
  menu: {
    ...darkTheme.menu,
    itemButtonHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    itemOverlayBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    itemSelectedBackgroundColor: '#c10564',
    itemInputSelectionColor: '#c10564',
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: '#c10564',
    indicatorStrokeInactive: 'rgba(255, 255, 255, 0.45)',
    indicatorFill: 'rgba(255, 106, 181, 0.35)',
    indicatorFillInactive: 'rgba(255, 106, 181, 0.2)',
    lineStroke: 'rgba(255, 106, 181, 0.28)',
  },
  splitButton: {
    ...darkTheme.splitButton,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: '#ff6ab5',
    selectedBackgroundColor: 'rgba(255, 106, 181, 0.15)',
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: '#c10564',
  },
  loginDialog: {
    ...darkTheme.loginDialog,
    buttonHoverBackground: 'rgba(255, 106, 181, 0.12)',
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: '#c10564',
    thumbBorderColor: '#c10564',
  },
  moreMenu: {
    ...darkTheme.moreMenu,
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    buttonActiveBackgroundColor: 'rgba(255, 106, 181, 0.18)',
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    menuItemActiveBackgroundColor: 'rgba(255, 106, 181, 0.18)',
    menuItemSelectedBackgroundColor: '#c10564',
    menuItemSelectedHoverBackgroundColor: '#c10564',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: '#c10564',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: '#ff6ab5',
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: '#ff6ab5',
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: '#513041',
    activeButtonFilledBackgroundColor: '#c10564',
    activeIconColor: '#ff6ab5',
    activeMutedTextColor: 'rgba(255, 106, 181, 0.6)',
    activeTextColor: '#ff6ab5',
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    buttonPressedBackgroundColor: 'rgba(255, 106, 181, 0.18)',
    focusRing: '2px solid #ff6ab5',
    selectionBackgroundColor: '#c10564',
  },
  titlebarMenu: {
    ...darkTheme.titlebarMenu,
    itemHoverBackgroundColor: 'rgba(255, 106, 181, 0.12)',
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: '#c10564',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#a30455',
    caretColor: '#ff6ab5',
    selectionBackgroundColor: '#c10564',
    selectionColor: '#ffffff',
  },
}, darkStyle);
