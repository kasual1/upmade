import { darkTheme, UpmadeTheme } from "@upmade/angular-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const angularThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: 'dark',
  global: {
    ...darkTheme.global,
    primaryColor: '#ff6ab5',
    primaryHoverColor: '#e65fa3',
    primaryTextColor: '#ffffff',
    focusRingColor: 'rgba(255, 106, 181, 0.3)',
  },
  button: {
    ...darkTheme.button,
    primaryBackgroundColor: '#ff6ab5',
    primaryHoverBackgroundColor: '#e65fa3',
    primaryActiveBackgroundColor: '#cc5591',
    primaryColor: '#ffffff',
    secondaryHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    textHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    secondaryActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
    textActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: '#ff6ab5',
    logoutButtonHoverBackgroundColor: '#e65fa3',
    logoutButtonActiveBackgroundColor: '#cc5591',
    logoutButtonColor: '#ffffff',
  },
  selection: {
    ...darkTheme.selection,
    borderColor: '#ff6ab5',
    boxBackgroundColor: 'rgba(255, 106, 181, 0.15)',
    boxBorderColor: 'rgba(255, 106, 181, 0.4)',
    handleStrokeColor: '#ff6ab5',
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    controlActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
    controlSelectedBackgroundColor: '#ff6ab5',
  },
  contextMenu: {
    ...darkTheme.contextMenu,
    itemHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    itemActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
  },
  menu: {
    ...darkTheme.menu,
    itemButtonHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    itemOverlayBackgroundColor: 'rgba(255, 106, 181, 0.12)',
    itemSelectedBackgroundColor: '#ff6ab5',
    itemInputSelectionColor: '#ff6ab5',
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: '#ff6ab5',
    indicatorStrokeInactive: 'rgba(255, 255, 255, 0.45)',
    indicatorFill: 'rgba(255, 106, 181, 0.35)',
    indicatorFillInactive: 'rgba(255, 106, 181, 0.2)',
    lineStroke: 'rgba(255, 106, 181, 0.28)',
  },
  splitButton: {
    ...darkTheme.splitButton,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: '#ff6ab5',
    selectedBackgroundColor: 'rgba(255, 106, 181, 0.15)',
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: '#ff6ab5',
  },
  loginDialog: {
    ...darkTheme.loginDialog,
    buttonHoverBackground: 'rgba(255, 106, 181, 0.2)',
    buttonActiveBackground: 'rgba(255, 106, 181, 0.28)',
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: '#ff6ab5',
    thumbBorderColor: '#ff6ab5',
  },
  moreMenu: {
    ...darkTheme.moreMenu,
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    buttonActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    menuItemActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
    menuItemSelectedBackgroundColor: '#ff6ab5',
    menuItemSelectedHoverBackgroundColor: '#ff6ab5',
    menuItemSelectedColor: '#ffffff',
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: '#ff6ab5',
    selectionColor: '#ffffff',
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: '#ff6ab5',
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: '#ff6ab5',
    spinnerHoverBackground: 'rgba(255, 106, 181, 0.2)',
    spinnerActiveBackground: 'rgba(255, 106, 181, 0.28)',
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: '#542b40',
    activeButtonFilledBackgroundColor: '#ff6ab5',
    activeIconColor: '#ff6ab5',
    activeMutedTextColor: 'rgba(255, 106, 181, 0.6)',
    activeTextColor: '#ff6ab5',
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    buttonPressedBackgroundColor: 'rgba(255, 106, 181, 0.28)',
    focusRing: '2px solid #ff6ab5',
    selectionBackgroundColor: '#ff6ab5',
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  titlebarMenu: {
    ...darkTheme.titlebarMenu,
    itemHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: '#ff6ab5',
    buttonColor: '#ffffff',
    buttonHoverBackgroundColor: '#e65fa3',
    caretColor: '#ff6ab5',
    selectionBackgroundColor: '#ff6ab5',
    selectionColor: '#ffffff',
  },
  backToContent: {
    ...darkTheme.backToContent,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  colorPalette: {
    ...darkTheme.colorPalette,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  dialog: {
    ...darkTheme.dialog,
    closeButtonHoverBackground: 'rgba(255, 106, 181, 0.2)',
    closeButtonActiveBackground: 'rgba(255, 106, 181, 0.28)',
  },
  fontSize: {
    ...darkTheme.fontSize,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  lineEndings: {
    ...darkTheme.lineEndings,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  notificationCard: {
    ...darkTheme.notificationCard,
    dismissButtonHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    dismissButtonActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
  },
  shapeFill: {
    ...darkTheme.shapeFill,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  shareDialog: {
    ...darkTheme.shareDialog,
    copyButtonHoverBackground: 'rgba(255, 106, 181, 0.2)',
  },
  strokeSize: {
    ...darkTheme.strokeSize,
    hoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  utilityPanel: {
    ...darkTheme.utilityPanel,
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
  },
  zoomPanel: {
    ...darkTheme.zoomPanel,
    buttonHoverBackgroundColor: 'rgba(255, 106, 181, 0.2)',
    buttonActiveBackgroundColor: 'rgba(255, 106, 181, 0.28)',
  },
  pillTabs: {
    ...darkTheme.pillTabs,
    tabBackgroundHover: 'rgba(255, 106, 181, 0.2)',
  },
};
