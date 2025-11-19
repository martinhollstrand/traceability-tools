import { COMPARE_LIMIT } from "@/lib/constants";

export function canAddSelection(currentIds: string[], nextId: string) {
  if (currentIds.includes(nextId)) return true;
  return currentIds.length < COMPARE_LIMIT;
}

export function toggleSelection(currentIds: string[], toolId: string) {
  if (currentIds.includes(toolId)) {
    return currentIds.filter((id) => id !== toolId);
  }
  if (currentIds.length >= COMPARE_LIMIT) {
    return currentIds;
  }
  return [...currentIds, toolId];
}
