import { CHART_COLORS, CHART_OTHER } from "../Charts/chartTheme";

// a device type has the same colour in every analytics widget
const DEVICE_COLORS = {
  desktop: CHART_COLORS[0],
  mobile: CHART_COLORS[1],
  tablet: CHART_COLORS[2],
};

export const getDeviceColor = (name = "") =>
  DEVICE_COLORS[name.toLowerCase()] || CHART_OTHER;

// [{ name, value }] from the API -> donut slices
export const toDeviceSlices = (devices) =>
  devices.map((device) => ({
    name: device.name,
    value: device.value || 0,
    color: getDeviceColor(device.name),
  }));
