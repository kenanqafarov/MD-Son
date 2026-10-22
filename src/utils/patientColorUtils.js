const STORAGE_KEY = "patient_colors";

export const PATIENT_DEFAULT_COLORS = [
  "#2563EB", // Blue
  "#059669", // Emerald
  "#7C3AED", // Purple
  "#D97706", // Amber
  "#DB2777", // Pink
  "#0891B2", // Cyan
  "#4F46E5", // Indigo
  "#0D9488", // Teal
  "#EA580C", // Orange
  "#65A30D", // Lime
  "#E11D48", // Rose
];

export const getDefaultPatientColor = (identifier) => {
  if (!identifier) return PATIENT_DEFAULT_COLORS[0];
  const str = String(
    typeof identifier === "object"
      ? (identifier.id || identifier.name || identifier.patientName || "")
      : identifier
  ).trim().toLowerCase();

  if (!str) return PATIENT_DEFAULT_COLORS[0];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PATIENT_DEFAULT_COLORS.length;
  return PATIENT_DEFAULT_COLORS[index];
};

export const getPatientColorMap = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error reading patient colors from localStorage:", e);
    return {};
  }
};

export const savePatientColor = ({ id, name, surname, finCode, color }) => {
  if (!color) return;
  try {
    const map = getPatientColorMap();

    if (id) {
      map[`id_${id}`] = color;
      map[String(id)] = color;
    }
    if (finCode && finCode.trim()) {
      map[`fin_${finCode.trim().toUpperCase()}`] = color;
    }
    const fullName = `${name || ""} ${surname || ""}`.trim().toLowerCase();
    if (fullName) {
      map[`name_${fullName}`] = color;
      map[fullName] = color;
    }
    const reverseFullName = `${surname || ""} ${name || ""}`.trim().toLowerCase();
    if (reverseFullName) {
      map[`name_${reverseFullName}`] = color;
      map[reverseFullName] = color;
    }
    if (name && name.trim()) {
      map[`first_${name.trim().toLowerCase()}`] = color;
      map[name.trim().toLowerCase()] = color;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Error saving patient color to localStorage:", e);
  }
};

export const getPatientColor = (patientOrNameOrId, fallback = null) => {
  if (!patientOrNameOrId) {
    return fallback !== null ? fallback : PATIENT_DEFAULT_COLORS[0];
  }

  const map = getPatientColorMap();

  if (typeof patientOrNameOrId === "object") {
    const p = patientOrNameOrId;
    if (p.id && (map[`id_${p.id}`] || map[String(p.id)])) {
      return map[`id_${p.id}`] || map[String(p.id)];
    }
    if (p.finCode && map[`fin_${p.finCode.trim().toUpperCase()}`]) {
      return map[`fin_${p.finCode.trim().toUpperCase()}`];
    }
    const fullName = `${p.name || ""} ${p.surname || ""}`.trim().toLowerCase();
    if (fullName && (map[`name_${fullName}`] || map[fullName])) {
      return map[`name_${fullName}`] || map[fullName];
    }

    const reverseFullName = `${p.surname || ""} ${p.name || ""}`.trim().toLowerCase();
    if (reverseFullName && (map[`name_${reverseFullName}`] || map[reverseFullName])) {
      return map[`name_${reverseFullName}`] || map[reverseFullName];
    }

    if (p.patientName) {
      const pName = p.patientName.trim().toLowerCase();
      if (map[`name_${pName}`] || map[pName]) return map[`name_${pName}`] || map[pName];
      if (map[`first_${pName}`]) return map[`first_${pName}`];
    }

    if (p.name && map[p.name.trim().toLowerCase()]) {
      return map[p.name.trim().toLowerCase()];
    }

    return fallback !== null ? fallback : getDefaultPatientColor(p);
  }

  const val = String(patientOrNameOrId).trim();
  if (map[`id_${val}`] || map[val]) return map[`id_${val}`] || map[val];
  if (map[`fin_${val.toUpperCase()}`]) return map[`fin_${val.toUpperCase()}`];

  const lowerVal = val.toLowerCase();
  if (map[`name_${lowerVal}`] || map[lowerVal]) return map[`name_${lowerVal}`] || map[lowerVal];
  if (map[`first_${lowerVal}`]) return map[`first_${lowerVal}`];

  for (const [key, col] of Object.entries(map)) {
    if (key.startsWith("name_") && (key.slice(5).includes(lowerVal) || lowerVal.includes(key.slice(5)))) {
      return col;
    }
  }

  return fallback !== null ? fallback : getDefaultPatientColor(val);
};
