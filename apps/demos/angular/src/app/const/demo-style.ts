import type { UpmadeTheme } from "@upmade/angular-editor";

/**
 * The landing pages' hero toolbar look for the editor's chrome (apps/website LandingPage/primitives/Toolbar and
 * tokens.css): white panels with a hairline border and a soft shadow, 16px corners on the panels and 12px on the
 * tools, and a neutral grey on hover and press. Popups (menus, tooltips, dialogs) float a little higher. The colours of
 * the selection and the selected tool live in the theme files; this only shapes the components, and both themes merge
 * it in with withDemoStyle().
 */
type ThemeStyle = Omit<UpmadeTheme, "name">;

interface Chrome {
  line: string;
  panelShadow: string;
  float: string;
  hover: string;
  press: string;
  separator: string;
}

function chrome({ line, panelShadow, float, hover, press, separator }: Chrome): ThemeStyle {
  const border = `1px solid ${line}`;
  return {
    toolbar: {
      border,
      boxShadow: panelShadow,
      borderRadius: "16px",
      padding: "8px",
      gap: "8px",
      controlBorderRadius: "12px",
      controlPadding: "8px",
      controlHoverBackgroundColor: hover,
      controlActiveBackgroundColor: press,
      separatorColor: separator,
    },
    zoomPanel: { border, boxShadow: panelShadow, borderRadius: "16px", buttonBorderRadius: "12px" },
    splitButton: { border, boxShadow: panelShadow, hoverBackgroundColor: hover },
    backToContent: { border, boxShadow: panelShadow },
    moreMenu: { border, boxShadow: float, borderRadius: "16px", innerBorderRadius: "12px", buttonHoverBackgroundColor: hover, buttonActiveBackgroundColor: press },
    menu: { border, boxShadow: float, itemButtonHoverBackgroundColor: hover },
    contextMenu: { border, boxShadow: float, borderRadius: "16px", itemBorderRadius: "12px", itemHoverBackgroundColor: hover, itemActiveBackgroundColor: press },
    tooltip: { border, boxShadow: panelShadow, borderRadius: "12px" },
    titlebarMenu: { border, boxShadow: float, itemHoverBackgroundColor: hover },
    dialog: { border, boxShadow: float },
    notificationCard: { border, boxShadow: float },
    chatBox: { border, boxShadow: float },
  };
}

export const lightStyle = chrome({
  line: "#ebebeb",
  panelShadow: "0 1px 2px rgba(16, 16, 24, 0.04), 0 8px 24px rgba(16, 16, 24, 0.07)",
  float: "0 1px 2px rgba(16, 16, 24, 0.04), 0 14px 36px rgba(16, 16, 24, 0.12)",
  hover: "hsl(0 0% 0% / 4.3%)",
  press: "hsl(0 0% 0% / 8.6%)",
  separator: "#ebebeb",
});

export const darkStyle = chrome({
  line: "#3a3a3a",
  panelShadow: "0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35)",
  float: "0 1px 2px rgba(0, 0, 0, 0.3), 0 14px 36px rgba(0, 0, 0, 0.45)",
  hover: "hsl(0 0% 100% / 8%)",
  press: "hsl(0 0% 100% / 14%)",
  separator: "#3a3a3a",
});

/** The theme with the style's values merged into its sections (the style wins). */
export function withDemoStyle(theme: UpmadeTheme, style: ThemeStyle): UpmadeTheme {
  const merged: Record<string, unknown> = { ...theme };
  for (const [section, values] of Object.entries(style)) {
    merged[section] = { ...(merged[section] as object | undefined), ...values };
  }
  return merged as unknown as UpmadeTheme;
}
