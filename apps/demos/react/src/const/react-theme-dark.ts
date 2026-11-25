import { darkTheme, UpmadeTheme } from "@upmade/react-editor";
import { darkStyle, withDemoStyle } from "./demo-style";

export const reactThemeDark: UpmadeTheme = withDemoStyle({
  ...darkTheme,
  name: "dark",
  global: {
    ...darkTheme.global,
    primaryColor: "#056bb4",
    primaryHoverColor: "#04599a",
    primaryTextColor: "#ffffff",
    focusRingColor: "rgba(111, 195, 255, 0.3)",
  },
  button: {
    ...darkTheme.button,
    primaryBackgroundColor: "#056bb4",
    primaryHoverBackgroundColor: "#04599a",
    primaryActiveBackgroundColor: "#034a80",
    primaryColor: "#ffffff",
  },
  currentUserDialog: {
    ...darkTheme.currentUserDialog,
    logoutButtonBackgroundColor: "#056bb4",
    logoutButtonHoverBackgroundColor: "#04599a",
    logoutButtonActiveBackgroundColor: "#034a80",
    logoutButtonColor: "#ffffff",
  },
  selection: {
    ...darkTheme.selection,
    borderColor: "#056bb4",
    boxBackgroundColor: "rgba(111, 195, 255, 0.15)",
    boxBorderColor: "rgba(111, 195, 255, 0.4)",
    handleStrokeColor: "#056bb4",
  },
  toolbar: {
    ...darkTheme.toolbar,
    controlHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
    controlActiveBackgroundColor: "rgba(111, 195, 255, 0.18)",
    controlSelectedBackgroundColor: "#056bb4",
  },
  contextMenu: {
    ...darkTheme.contextMenu,
    itemHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
    itemActiveBackgroundColor: "rgba(111, 195, 255, 0.18)",
  },
  menu: {
    ...darkTheme.menu,
    itemButtonHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
    itemOverlayBackgroundColor: "rgba(111, 195, 255, 0.12)",
    itemSelectedBackgroundColor: "#056bb4",
    itemInputSelectionColor: "#056bb4",
  },
  snap: {
    ...darkTheme.snap,
    indicatorStroke: "#056bb4",
    indicatorStrokeInactive: "rgba(255, 255, 255, 0.45)",
    indicatorFill: "rgba(111, 195, 255, 0.35)",
    indicatorFillInactive: "rgba(111, 195, 255, 0.2)",
    lineStroke: "rgba(111, 195, 255, 0.28)",
  },
  splitButton: {
    ...darkTheme.splitButton,
    hoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
  },
  dropdown: {
    ...darkTheme.dropdown,
    accentColor: "#056bb4",
    selectedBackgroundColor: "rgba(111, 195, 255, 0.15)",
  },
  slideToggle: {
    ...darkTheme.slideToggle,
    trackCheckedColor: "#056bb4",
  },
  loginDialog: {
    ...darkTheme.loginDialog,
    buttonHoverBackground: "rgba(111, 195, 255, 0.12)",
  },
  opacitySlider: {
    ...darkTheme.opacitySlider,
    activeColor: "#056bb4",
    thumbBorderColor: "#056bb4",
  },
  moreMenu: {
    ...darkTheme.moreMenu,
    buttonHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
    buttonActiveBackgroundColor: "rgba(111, 195, 255, 0.18)",
  },
  masterDetail: {
    ...darkTheme.masterDetail,
    menuItemHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
    menuItemActiveBackgroundColor: "rgba(111, 195, 255, 0.18)",
    menuItemSelectedBackgroundColor: "#056bb4",
    menuItemSelectedHoverBackgroundColor: "#056bb4",
    menuItemSelectedColor: "#ffffff",
  },
  text: {
    ...darkTheme.text,
    selectionBackgroundColor: "#056bb4",
    selectionColor: "#ffffff",
  },
  textInput: {
    ...darkTheme.textInput,
    focusBorderColor: "#056bb4",
  },
  numericInput: {
    ...darkTheme.numericInput,
    focusBorderColor: "#056bb4",
  },
  titlebar: {
    ...darkTheme.titlebar,
    activeBackgroundColor: "#314451",
    activeButtonFilledBackgroundColor: "#056bb4",
    activeIconColor: "#056bb4",
    activeMutedTextColor: "rgba(111, 195, 255, 0.6)",
    activeTextColor: "#056bb4",
    buttonHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
    buttonPressedBackgroundColor: "rgba(111, 195, 255, 0.18)",
    focusRing: "2px solid #056bb4",
    selectionBackgroundColor: "#056bb4",
  },
  titlebarMenu: {
    ...darkTheme.titlebarMenu,
    itemHoverBackgroundColor: "rgba(111, 195, 255, 0.12)",
  },
  chatBox: {
    ...darkTheme.chatBox,
    buttonBackgroundColor: "#056bb4",
    buttonColor: "#ffffff",
    buttonHoverBackgroundColor: "#04599a",
    caretColor: "#056bb4",
    selectionBackgroundColor: "#056bb4",
    selectionColor: "#ffffff",
  },
}, darkStyle);
