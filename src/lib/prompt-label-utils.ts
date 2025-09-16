import type { PromptLabel } from '@prisma/client';

import type { PromptVersionWithLabel } from '@/types/prompt';

/**
 * Resolves the prompt label name for a prompt version
 * First tries to find the label by ID in the provided labels array,
 * then falls back to the label attached to the version
 * @param version - The prompt version to get the label name for
 * @param labels - Array of available prompt labels to search through
 * @returns The prompt label name if found, undefined otherwise
 */
export function getPromptLabelName(
  version: PromptVersionWithLabel,
  labels: PromptLabel[]
): string | undefined {
  if (!version.labelId) {
    return undefined;
  }

  // First try to find in the labels array
  const labelFromArray = labels.find(label => label.id === version.labelId);
  if (labelFromArray) {
    return labelFromArray.name;
  }

  // Fall back to the label attached to the version
  return version.label?.name;
}

/**
 * Gets the display text for a prompt label, returning a fallback if no label is found
 * @param version - The prompt version to get the label name for
 * @param labels - Array of available prompt labels to search through
 * @param fallback - Text to display when no label is found (default: 'No Label')
 * @returns The prompt label name or fallback text
 */
export function getPromptLabelDisplayText(
  version: PromptVersionWithLabel,
  labels: PromptLabel[],
  fallback = 'No Label'
): string {
  return getPromptLabelName(version, labels) || fallback;
}

/**
 * Filters prompt versions by prompt label ID
 * @param versions - Array of prompt versions to filter
 * @param labelId - Prompt label ID to filter by, or null for versions without labels
 * @returns Filtered array of versions
 */
export function filterPromptVersionsByLabel(
  versions: PromptVersionWithLabel[],
  labelId: string | null
): PromptVersionWithLabel[] {
  if (labelId === null) {
    return versions.filter(version => !version.labelId);
  }

  return versions.filter(version => version.labelId === labelId);
}
