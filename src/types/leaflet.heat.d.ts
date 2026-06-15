// Makes this file a module so 'declare module' below augments instead of replacing.
export {};

declare module 'leaflet.heat' {
  const content: unknown;
  export default content;
}

declare module 'leaflet' {
  interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number | string, string>;
  }

  // HeatLayer extends Layer (via structural compatibility with Map.removeLayer)
  interface HeatLayer extends Layer {
    setLatLngs(latlngs: Array<[number, number] | [number, number, number]>): this;
    addLatLng(latlng: [number, number] | [number, number, number]): this;
    setOptions(options: HeatMapOptions): this;
    redraw(): this;
  }

  function heatLayer(
    latlngs: Array<[number, number] | [number, number, number]>,
    options?: HeatMapOptions
  ): HeatLayer;
}
