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
    secondaryHoverBackgroundColor: '#ffe1f0',
    textHoverBackgroundColor: '#ffe1f0',
    secondaryActiveBackgroundColor: '#ffd2e9',
    textActiveBackgroundColor: '#ffd2e9',
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
  contextMenu: {
    ...lightTheme.contextMenu,
    itemHoverBackgroundColor: '#ffe1f0',
    itemActiveBackgroundColor: '#ffd2e9',
  },
  toolbar: {
    ...lightTheme.toolbar,
    controlHoverBackgroundColor: '#ffe1f0',
    controlActiveBackgroundColor: '#ffd2e9',
    controlSelectedBackgroundColor: '#ff6ab5',
  },
  menu: {
    ...lightTheme.menu,
    itemButtonHoverBackgroundColor: '#ffe1f0',
    itemOverlayBackgroundColor: 'rgba(255, 106, 181, 0.08)',
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
  splitButton: {
    ...lightTheme.splitButton,
    hoverBackgroundColor: '#ffe1f0',
  },
  dropdown: {
    ...lightTheme.dropdown,
    accentColor: '#ff6ab5',
    selectedBackgroundColor: 'rgba(255, 106, 181, 0.1)',
    hoverBackgroundColor: '#ffe1f0',
  },
  slideToggle: {
    ...lightTheme.slideToggle,
    trackCheckedColor: '#ff6ab5',
  },
  loginDialog: {
    ...lightTheme.loginDialog,
    buttonHoverBackground: '#ffe1f0',
    buttonActiveBackground: '#ffd2e9',
  },
  opacitySlider: {
    ...lightTheme.opacitySlider,
    activeColor: '#ff6ab5',
    thumbBorderColor: '#ff6ab5',
  },
  moreMenu: {
    ...lightTheme.moreMenu,
    buttonHoverBackgroundColor: '#ffe1f0',
    buttonActiveBackgroundColor: '#ffd2e9',
  },
  masterDetail: {
    ...lightTheme.masterDetail,
    menuItemHoverBackgroundColor: '#ffe1f0',
    menuItemActiveBackgroundColor: '#ffd2e9',
    menuItemSelectedBackgroundColor: 'rgba(255, 106, 181, 0.1)',
    menuItemSelectedHoverBackgroundColor: 'rgba(255, 106, 181, 0.15)',
    menuItemSelectedColor: '#ff6ab5',
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
    spinnerHoverBackground: '#ffe1f0',
    spinnerActiveBackground: '#ffd2e9',
  },
  titlebar: {
    ...lightTheme.titlebar,
    activeBackgroundColor: '#ffedf6',
    activeButtonFilledBackgroundColor: '#ff6ab5',
    activeIconColor: '#ff6ab5',
    activeMutedTextColor: 'rgba(255, 106, 181, 0.6)',
    activeTextColor: '#ff6ab5',
    buttonHoverBackgroundColor: '#ffe1f0',
    buttonPressedBackgroundColor: '#ffd2e9',
    focusRing: '2px solid #ff6ab5',
    selectionBackgroundColor: '#ff6ab5',
    hoverBackgroundColor: '#ffe1f0',
  },
  titlebarMenu: {
    ...lightTheme.titlebarMenu,
    itemHoverBackgroundColor: '#ffe1f0',
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
  backToContent: {
    ...lightTheme.backToContent,
    hoverBackgroundColor: '#ffe1f0',
  },
  colorPalette: {
    ...lightTheme.colorPalette,
    hoverBackgroundColor: '#ffe1f0',
  },
  dialog: {
    ...lightTheme.dialog,
    closeButtonHoverBackground: '#ffe1f0',
    closeButtonActiveBackground: '#ffd2e9',
  },
  fontSize: {
    ...lightTheme.fontSize,
    hoverBackgroundColor: '#ffe1f0',
  },
  lineEndings: {
    ...lightTheme.lineEndings,
    hoverBackgroundColor: '#ffe1f0',
  },
  notificationCard: {
    ...lightTheme.notificationCard,
    dismissButtonHoverBackgroundColor: '#ffe1f0',
    dismissButtonActiveBackgroundColor: '#ffd2e9',
  },
  shapeFill: {
    ...lightTheme.shapeFill,
    hoverBackgroundColor: '#ffe1f0',
  },
  shareDialog: {
    ...lightTheme.shareDialog,
    copyButtonHoverBackground: '#ffe1f0',
  },
  strokeSize: {
    ...lightTheme.strokeSize,
    hoverBackgroundColor: '#ffe1f0',
  },
  utilityPanel: {
    ...lightTheme.utilityPanel,
    buttonHoverBackgroundColor: '#ffe1f0',
  },
  zoomPanel: {
    ...lightTheme.zoomPanel,
    buttonHoverBackgroundColor: '#ffe1f0',
    buttonActiveBackgroundColor: '#ffd2e9',
  },
  pillTabs: {
    ...lightTheme.pillTabs,
    tabBackgroundHover: '#ffe1f0',
  },
};
