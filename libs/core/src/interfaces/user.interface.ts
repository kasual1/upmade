export interface IUpmadeUser {
  /** Unique user identifier */
  id: string;

  /** User's first name */
  firstName?: string;

  /** User's last name */
  lastName?: string;

  /** Display name (takes precedence over firstName/lastName for display) */
  displayName?: string;

  /** User's email address */
  email?: string;

  /** URL to the user's profile image */
  profileImageUrl?: string;

  /** OAuth provider name (e.g., 'google', 'github', 'microsoft') */
  oauthProvider?: string;

  /** OAuth provider-specific user identifier */
  oauthProviderId?: string;

  /** User's preferred color (for avatar background when showing initials) */
  color?: string;

  /**
   * Icon shown before the name on the user's cursor label, as collaborators see it: SVG markup or an image URL
   * (http(s), `data:image/` or relative). When omitted, a circle in the user's `color` is shown. Shared with collaborators, so keep it small
   * (at most 8192 characters).
   */
  cursorIcon?: string;

  /** Whether the user is a guest (not authenticated) */
  isGuest?: boolean;

  /** `'agent'` for an `UpmadeAgent`; people leave it unset. */
  kind?: 'user' | 'agent';
}
