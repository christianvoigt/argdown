export interface CanSelectNode {
  selectNode(id: string): void;
  deselectNode(): void;
}
export type OnSelectionChangedHandler = (id: string | null) => void;
