import { lightTheme, UpmadeTheme } from "@upmade/angular-editor";
import { lightStyle, withDemoStyle } from "./demo-style";

export const angularThemeLight: UpmadeTheme = withDemoStyle({
  ...lightTheme,
  name: 'light',
  global: {
    ...lightTheme.global,
    primaryColor: '#c10564',
    primaryHoverColor: '#a30455',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(255, 106, 181, 0.4)',
  },
  button: {
    ...lightTheme.button,
    primaryBackgroundColor: '#c10564',
    primaryHoverBackgroundColor: '#a30455',
    primaryActiveBackgroundColor: '#86034a',
    primaryColor: '#ffffff',
  },
  currentUserDialog: {
    ...lightTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#c10564',
    logoutButtonHoverBackgroundColor: '#a30455',
    logoutButtonActiveBackgroundColor: '#86034a',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...lightTheme.selection,
    borderColor: '#c10564',
    handleStrokeColor: '#c10564',
    boxBackgroundColor: 'rgba(255, 106, 181, 0.25)',
    boxBorderColor: 'rgba(255, 106, 181, 0.7)',
  },
  contextMenu: {
    ...lightTheme.contextMenu,
    itemHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    itemActiveBackgroundColor: 'rgba(255, 106, 181, 0.24)',
  },
  toolbar: {
    ...lightTheme.toolbar,
    controlHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    controlActiveBackgroundColor: 'rgba(255, 106, 181, 0.24)',
    controlSelectedBackgroundColor: '#c10564',
  },
  menu: {
    ...lightTheme.menu,
    itemButtonHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    itemOverlayBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    itemSelectedBackgroundColor: '#c10564',
    itemInputSelectionColor: '#c10564',
  },
  snap: {
    ...lightTheme.snap,
    indicatorStroke: '#c10564',
    indicatorStrokeInactive: 'rgba(255, 106, 181, 0.7)',
    indicatorFill: 'rgba(255, 106, 181, 0.32)',
    indicatorFillInactive: 'rgba(255, 106, 181, 0.2)',
    lineStroke: 'rgba(255, 106, 181, 0.4)',
  },
  splitButton: {
    ...lightTheme.splitButton,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
  },
  dropdown: {
    ...lightTheme.dropdown,
    accentColor: '#c10564',
    selectedBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  slideToggle: {
    ...lightTheme.slideToggle,
    trackCheckedColor: '#c10564',
  },
  loginDialog: {
    ...lightTheme.loginDialog,
    buttonHoverBackground: 'rgba(255, 106, 181, 0.16)',
  },
  opacitySlider: {
    ...lightTheme.opacitySlider,
    activeColor: '#c10564',
    thumbBorderColor: '#c10564',
  },
  moreMenu: {
    ...lightTheme.moreMenu,
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    buttonActiveBackgroundColor: 'rgba(255, 106, 181, 0.24)',
  },
  masterDetail: {
    ...lightTheme.masterDetail,
    menuItemHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    menuItemActiveBackgroundColor: 'rgba(255, 106, 181, 0.24)',
    menuItemSelectedBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    menuItemSelectedHoverBackgroundColor: 'rgba(255, 106, 181, 0.3)',
    menuItemSelectedColor: '#c10564',
  },
  text: {
    ...lightTheme.text,
    selectionBackgroundColor: '#c10564',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...lightTheme.textInput,
    focusBorderColor: '#c10564',
  },
  numericInput: {
    ...lightTheme.numericInput,
    focusBorderColor: '#c10564',
  },
  titlebar: {
    ...lightTheme.titlebar,
    activeBackgroundColor: '#ffe7f3',
    activeButtonFilledBackgroundColor: '#c10564',
    activeIconColor: '#c10564',
    activeMutedTextColor: 'rgba(193, 5, 100, 0.6)',
    activeTextColor: '#c10564',
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
    buttonPressedBackgroundColor: 'rgba(255, 106, 181, 0.24)',
    focusRing: '2px solid #c10564',
    selectionBackgroundColor: '#c10564',
  },
  titlebarMenu: {
    ...lightTheme.titlebarMenu,
    itemHoverBackgroundColor: 'rgba(255, 106, 181, 0.16)',
  },
  chatBox: {
    ...lightTheme.chatBox,
    buttonBackgroundColor: '#c10564',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#a30455',
    caretColor: '#c10564',
    selectionBackgroundColor: '#c10564',
    selectionColor: '#ffffff',
  },
}, lightStyle);
