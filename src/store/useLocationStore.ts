import { create } from "zustand";
import { LocationService } from "../services/location.service";
import { Coordinate } from "../types/location";

interface LocationState {
  currentLocation: Coordinate | null;
  currentAddress: string | null;
  isFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchLocation: () => Promise<void>;
  setLocation: (coords: Coordinate, address?: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  currentAddress: null,
  isFallback: false,
  isLoading: false,
  error: null,

  fetchLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const { coords, isFallback } = await LocationService.getCurrentLocation();
      const address = await LocationService.getAddressFromCoords(coords);
      
      set({
        currentLocation: coords,
        currentAddress: address,
        isFallback,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Lỗi khi lấy vị trí",
        isLoading: false,
      });
    }
  },

  setLocation: (coords: Coordinate, address?: string) => {
    set({
      currentLocation: coords,
      currentAddress: address || null,
      isFallback: false,
    });
  },
}));
