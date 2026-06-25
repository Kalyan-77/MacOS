import { create } from "zustand";
import defaultWallpaper from "../assets/Wallpaper/img1.jpg";

export const useSystemStore = create((set) => ({
  wifiEnabled: true,
  bluetoothEnabled: true,
  airDropEnabled: false,
  doNotDisturb: false,
  brightness: 75,
  volume: 60,
  wallpaperUrl: defaultWallpaper,

  setWifiEnabled: (enabled) => set({ wifiEnabled: enabled }),
  toggleWifi: () => set((state) => ({ wifiEnabled: !state.wifiEnabled })),

  setBluetoothEnabled: (enabled) => set({ bluetoothEnabled: enabled }),
  toggleBluetooth: () => set((state) => ({ bluetoothEnabled: !state.bluetoothEnabled })),

  setAirDropEnabled: (enabled) => set({ airDropEnabled: enabled }),
  toggleAirDrop: () => set((state) => ({ airDropEnabled: !state.airDropEnabled })),

  setDoNotDisturb: (enabled) => set({ doNotDisturb: enabled }),
  toggleDoNotDisturb: () => set((state) => ({ doNotDisturb: !state.doNotDisturb })),

  setBrightness: (brightness) => set({ brightness: Number(brightness) }),
  setVolume: (volume) => set({ volume: Number(volume) }),
  
  setWallpaperUrl: (url) => set({ wallpaperUrl: url }),
}));
