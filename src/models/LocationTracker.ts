// Tracker de Ubicación — MangaTools (capa Model)
// Obtiene las coordenadas GPS actuales del dispositivo vía expo-location.

import * as Location from 'expo-location';
import { TaskLocation } from './Task';

export type CaptureLocationResult =
  | { ok: true; location: TaskLocation }
  | { ok: false; reason: 'denied' | 'failed' };

export const LocationTracker = {
  /**
   * Pide permiso de ubicación y obtiene la posición actual.
   */
  async capture(): Promise<CaptureLocationResult> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { ok: false, reason: 'denied' };
    }

    try {
      const position = await Location.getCurrentPositionAsync({});
      return {
        ok: true,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
    } catch {
      return { ok: false, reason: 'failed' };
    }
  },
};
