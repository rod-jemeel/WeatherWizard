import * as L from "leaflet";

declare module "leaflet" {
  namespace L {
    function heatLayer(
      latlngs:
        | Array<[number, number, number?]>
        | Array<L.LatLng>
        | Array<L.LatLngExpression>,
      options?: HeatLayerOptions
    ): L.HeatLayer;

    interface HeatLayerOptions {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: { [key: string]: string } | { [key: number]: string };
    }

    interface HeatLayer extends L.Layer {
      setLatLngs(
        latlngs:
          | Array<[number, number, number?]>
          | Array<L.LatLng>
          | Array<L.LatLngExpression>
      ): this;
      addLatLng(
        latlng: [number, number, number?] | L.LatLng | L.LatLngExpression
      ): this;
      setOptions(options: HeatLayerOptions): this;
      redraw(): this;
    }
  }
}
