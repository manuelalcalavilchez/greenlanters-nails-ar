// designsApi.js
// FASE 1: solo persistencia local (localStorage). No hay backend todavía.
// Las funciones de conexión con un backend real (FastAPI u otro) se añaden
// en una fase posterior; no se incluyen aquí para no dejar código que
// dependa de un servidor que no existe en este proyecto.

const LOCAL_KEY = 'nail_designs_local_v1';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

export function saveDesignLocal(design) {
  const list = readLocal();
  const withId = design.id ? design : { ...design, id: crypto.randomUUID() };
  const idx = list.findIndex((d) => d.id === withId.id);
  if (idx >= 0) list[idx] = withId;
  else list.push(withId);
  writeLocal(list);
  return withId;
}

export function listDesignsLocal() {
  return readLocal();
}

export function deleteDesignLocal(id) {
  writeLocal(readLocal().filter((d) => d.id !== id));
}
