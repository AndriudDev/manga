// Pruebas del periférico de geolocalización — MangaTools
// Verifica la fiabilidad de LocationTracker.capture() frente a los tres
// escenarios posibles del plugin nativo: permiso concedido, permiso denegado
// y fallo al obtener la posición.

import * as Location from 'expo-location';
import { LocationTracker } from '../src/models/LocationTracker';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockedRequestPermission = Location.requestForegroundPermissionsAsync as jest.MockedFunction<
  typeof Location.requestForegroundPermissionsAsync
>;
const mockedGetPosition = Location.getCurrentPositionAsync as jest.MockedFunction<
  typeof Location.getCurrentPositionAsync
>;

describe('LocationTracker.capture', () => {
  beforeEach(() => {
    mockedRequestPermission.mockReset();
    mockedGetPosition.mockReset();
  });

  it('devuelve las coordenadas cuando el permiso es concedido', async () => {
    mockedRequestPermission.mockResolvedValue({ status: 'granted' } as never);
    mockedGetPosition.mockResolvedValue({
      coords: { latitude: -34.6037, longitude: -58.3816 },
    } as unknown as Location.LocationObject);

    const result = await LocationTracker.capture();

    expect(result).toEqual({
      ok: true,
      location: { latitude: -34.6037, longitude: -58.3816 },
    });
    expect(mockedGetPosition).toHaveBeenCalledTimes(1);
  });

  it('no consulta la posición y reporta "denied" sin permiso', async () => {
    mockedRequestPermission.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
    } as never);

    const result = await LocationTracker.capture();

    expect(result).toEqual({ ok: false, reason: 'denied', canAskAgain: false });
    expect(mockedGetPosition).not.toHaveBeenCalled();
  });

  it('reporta "failed" si el GPS falla con permiso concedido', async () => {
    mockedRequestPermission.mockResolvedValue({ status: 'granted' } as never);
    mockedGetPosition.mockRejectedValue(new Error('GPS apagado'));

    const result = await LocationTracker.capture();

    expect(result).toEqual({ ok: false, reason: 'failed', canAskAgain: true });
  });

  it('refleja canAskAgain según el plugin nativo (reintento posible)', async () => {
    mockedRequestPermission.mockResolvedValue({
      status: 'denied',
      canAskAgain: true,
    } as never);
    mockedGetPosition.mockClear();

    const result = await LocationTracker.capture();

    expect(result).toEqual({ ok: false, reason: 'denied', canAskAgain: true });
    expect(mockedGetPosition).not.toHaveBeenCalled();
  });
});
