import type { AvatarProps, DropdownMenuItem, KbdProps } from "@nuxt/ui";

// import type { ColorType, VariantType } from ".";

/**
 * Base properties shared by all row action menu items
 */
type ActionItemBase = {
  /**
   * The text label for the menu item
   */
  label?: string;

  /**
   * The icon to display (e.g., 'i-lucide-user')
   */
  icon?: string;

  /**
   * An avatar object instead of an icon
   */
  avatar?: AvatarProps;

  /**
   * Highlight color for the item
   */
  color?: ColorType;

  variant?: VariantType;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Custom slot name for the item
   */
  slot?: string;

  /**
   * Custom CSS classes
   */
  class?: string;

  /**
   * Callback function when item is selected
   */
  onSelect?: (e: Event) => void;

  /**
   * Nested menu items (can be a flat array or grouped arrays)
   */
  children?: DropdownMenuItem[] | DropdownMenuItem[][];
  type?: "link" | "label" | "separator" | "checkbox";

  /**
   * Custom UI configuration for styling specific parts
   */
  ui?: {
    item?: string;
    label?: string;
    separator?: string;
    itemLeadingIcon?: string;
    itemLeadingAvatarSize?: string;
    itemLeadingAvatar?: string;
    itemLabel?: string;
    itemLabelExternalIcon?: string;
    itemTrailing?: string;
    itemTrailingIcon?: string;
    itemTrailingKbds?: string;
    itemTrailingKbdsSize?: string;
  };

  /**
   * Keyboard shortcuts to display (e.g., ['meta', 'n'])
   */
  kbds?: string[] | KbdProps[];
};

/**
 * Link-specific properties (any property from the Link component)
 */
type ActionItemLink = {
  /**
   * The type of item - link (default)
   */
  type?: "link";

  /**
   * Navigation target (internal or external URL)
   */
  to?: string;

  /**
   * Link target (e.g., '_blank' for new tab)
   */
  target?: string;

  /**
   * Highlight color for the item
   */
  color?: ColorType;

  /**
   * Any other Link component properties
   */
  [key: string]: any;
} & ActionItemBase;

/**
 * Label item - non-interactive header/label
 */
type ActionItemLabel = {
  /**
   * The type of item - label (non-interactive header)
   */
  type: "label";

  /**
   * Label must be defined for label type
   */
  label: string;
} & ActionItemBase;

/**
 * Separator item - visual divider
 */
type ActionItemSeparator = {
  /**
   * The type of item - separator (visual divider)
   */
  type: "separator";
} & Omit<ActionItemBase, "label" | "icon" | "avatar" | "onSelect" | "kbds">;

/**
 * Checkbox item - checkable/toggleable item
 */
type ActionItemCheckbox = {
  /**
   * The type of item - checkbox (checkable item)
   */
  type: "checkbox";

  /**
   * The checked state of the checkbox
   */
  checked?: boolean;

  /**
   * Callback when checked state changes
   */
  onUpdateChecked?: (checked: boolean) => void;

  /**
   * Highlight color for the item
   */
  color?: ColorType;
} & ActionItemBase;

/**
 * Union type for all action item types
 */
export type RowActionItem
  = | ActionItemLink
    | ActionItemLabel
    | ActionItemSeparator
    | ActionItemCheckbox;

/**
 * Type for grouped dropdown menu items (arrays of arrays)
 */
export type RowActionItems = RowActionItem[] | RowActionItem[][];

/**
 * Helper type for getRowItems function return value
 */
export type GetRowItemsReturn = RowActionItem[] | RowActionItem[][];
