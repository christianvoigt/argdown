export interface IMapState {
  size: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  scale: number;
  selectedNode?: string | null;
}
export const defaultMapState: IMapState = {
  size: { width: 0, height: 0 },
  position: { x: 0, y: 0 },
  scale: 1
};
