export const DOCTOR_PALETTE = [
  "#2563EB", // Royal Blue
  "#7C3AED", // Vivid Purple
  "#059669", // Emerald Green
  "#D97706", // Amber
  "#DB2777", // Pink Rose
  "#0891B2", // Cyan Teal
  "#4F46E5", // Indigo
  "#DC2626", // Red
  "#EA580C", // Orange
  "#0D9488", // Deep Teal
  "#84CC16", // Lime
  "#6366F1", // Violet
];

export const isValidColor = (color) => {
  if (!color || typeof color !== "string") return false;
  const trimmed = color.trim().toLowerCase();
  if (
    trimmed === "#ffffff" ||
    trimmed === "#fff" ||
    trimmed === "white" ||
    trimmed === "string" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed);
  const isRgb = /^rgba?\s*\(/.test(trimmed);
  const isHsl = /^hsla?\s*\(/.test(trimmed);
  return isHex || isRgb || isHsl;
};

export const isValidHexColor = isValidColor;

export const getDefaultDoctorColor = (identifier) => {
  if (!identifier) return DOCTOR_PALETTE[0];
  const str = String(
    typeof identifier === "object"
      ? (identifier.id || identifier.doctorId || identifier.name || identifier.username || "")
      : identifier
  ).trim();

  if (!str) return DOCTOR_PALETTE[0];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DOCTOR_PALETTE.length;
  return DOCTOR_PALETTE[index];
};

export const getDoctorColor = (doctorOrId, workers = [], doctors = [], fallbackKey = "") => {
  if (!doctorOrId) {
    if (fallbackKey) return getDefaultDoctorColor(fallbackKey);
    return DOCTOR_PALETTE[0];
  }

  if (typeof doctorOrId === "object") {
    if (isValidColor(doctorOrId.colorCode)) {
      return doctorOrId.colorCode.trim();
    }
    const docId =
      doctorOrId.id ||
      doctorOrId.doctorId ||
      doctorOrId.baseUserId ||
      doctorOrId.baseUser;

    if (docId) {
      const docIdStr =
        typeof docId === "object"
          ? String(docId.id || docId.doctorId || "")
          : String(docId).trim();

      if (docIdStr) {
        const foundInWorkers = (workers || []).find(
          (w) => String(w.id) === docIdStr || String(w.doctorId) === docIdStr
        );
        if (foundInWorkers && isValidColor(foundInWorkers.colorCode)) {
          return foundInWorkers.colorCode.trim();
        }

        const foundInDoctors = (doctors || []).find(
          (d) => String(d.id) === docIdStr || String(d.doctorId) === docIdStr
        );
        if (foundInDoctors && isValidColor(foundInDoctors.colorCode)) {
          return foundInDoctors.colorCode.trim();
        }

        return getDefaultDoctorColor(docIdStr);
      }
    }

    return getDefaultDoctorColor(doctorOrId);
  }

  const idStr = String(doctorOrId).trim();
  const found =
    (workers || []).find(
      (w) => String(w.id) === idStr || String(w.doctorId) === idStr
    ) ||
    (doctors || []).find(
      (d) => String(d.id) === idStr || String(d.doctorId) === idStr
    );

  if (found && isValidColor(found.colorCode)) {
    return found.colorCode.trim();
  }

  return getDefaultDoctorColor(idStr || fallbackKey);
};
