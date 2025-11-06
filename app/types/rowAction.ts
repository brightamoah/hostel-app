import type { AvatarProps, DropdownMenuItem, KbdProps } from "@nuxt/ui";

import type { ColorType, VariantType } from ".";

/**
 * Base properties shared by all row action menu items
 */
interface ActionItemBase {
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
}

/**
 * Link-specific properties (any property from the Link component)
 */
interface ActionItemLink extends ActionItemBase {
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
}

/**
 * Label item - non-interactive header/label
 */
interface ActionItemLabel extends ActionItemBase {
  /**
   * The type of item - label (non-interactive header)
   */
  type: "label";

  /**
   * Label must be defined for label type
   */
  label: string;
}

/**
 * Separator item - visual divider
 */
interface ActionItemSeparator extends Omit<ActionItemBase, "label" | "icon" | "avatar" | "onSelect" | "kbds"> {
  /**
   * The type of item - separator (visual divider)
   */
  type: "separator";
}

/**
 * Checkbox item - checkable/toggleable item
 */
interface ActionItemCheckbox extends ActionItemBase {
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
}

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
