// cameraService.js — utilidades para comprobar soporte de cámara antes de
// intentar iniciarla en ARCamera.jsx (evita errores confusos en navegadores
// sin soporte o sin HTTPS, requisito de getUserMedia salvo en localhost).

export function isCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function isSecureContextOk() {
  // getUserMedia requiere HTTPS (o localhost) en navegadores modernos.
  return window.isSecureContext;
}

export async function listVideoInputDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}
