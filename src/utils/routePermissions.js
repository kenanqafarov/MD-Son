// Route → icazə modulu xəritəsi. main.jsx (route guard) və SidebarMenu eyni
// mənbədən istifadə edir ki, iki nüsxə bir-birindən ayrılmasın.
//
// Pattern-lər seqment üzrə uyğunlaşdırılır ("*" = istənilən bir seqment) və
// prefiks kimi işləyir: "/stock/import" həm "/stock/import", həm də
// "/stock/import/edit/5" ilə uyğun gəlir, amma "/stock/importx" ilə yox.
// Ən çox seqmenti olan (ən spesifik) pattern qalib gəlir.
//
// module: string və ya string[] (siyahıdan hər hansı biri kifayətdir).
// alsoRequire: əlavə tələb olunan modul (READ).
// readOnly: true olduqda add/edit üçün CREATE/UPDATE tələb olunmur.

// Giriş tələb etməyən və ya hər daxil olmuş istifadəçiyə açıq səhifələr
const PUBLIC_PATHS = ["/", "/login", "/login2", "/change-password"];

// Mövcud olan, amma icazə matrisində modulu olmayan səhifələr.
// Modul əlavə olunanda buradan çıxarılıb ROUTE_RULES-a köçürülməlidir.
const UNGUARDED_PATHS = [
  "/blacklist",
  "/order-status",
  "/add-order-status",
  "/edit-order-status",
  "/settings/color",
  "/appointment/card",
];

const PATIENT = "/patients/patient/*";

const ROUTE_RULES = [
  // Employees
  { pattern: "/employees", module: "Həkimlər" },
  { pattern: "/employees/employee-schedule", module: "Həkimlərin iş qrafiki" },
  { pattern: "/employees/work-schedule", module: "Həkimlərin iş qrafiki" },
  { pattern: "/admin-users", module: "Admin istifadəçiləri" },

  // Appointments & Queue
  { pattern: "/appointments", module: "Ümumi təqvim" },
  { pattern: "/queue", module: "Növbə gözləyənlər" },

  // Patients
  { pattern: "/patients", module: "Pasientlər" },
  // Pasiyent tabları: öz modulu + Pasientlər READ.
  // readOnly: Hal-hazırda rollar bu modullara yalnız READ verir (məs. "Həkim"),
  // CREATE/UPDATE tələb etsək həkimlər plan/müalicə yarada bilməz.
  { pattern: `${PATIENT}/examination`, module: "Müayinələri", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/plans`, module: "Planları", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/plan`, module: "Planları", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/compare-plans`, module: "Planları", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/treatment`, module: "Müalicələr", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/history`, module: "Anamnez", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/insurance`, module: "Sığortaları", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/prescription`, module: "Reseptləri", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/xray`, module: "Rentgen", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/images`, module: "Fotolar", alsoRequire: "Pasientlər", readOnly: true },
  { pattern: `${PATIENT}/video`, module: "Videolar", alsoRequire: "Pasientlər", readOnly: true },

  // Reports
  { pattern: "/reports", module: "Hesabat" },

  // Lab
  { pattern: "/sent-orders", module: "Göndərilən sifarişlər" },
  { pattern: "/received-orders", module: "Gələn sifarişlər" },
  { pattern: "/lab/order/add", module: "Göndərilən sifarişlər" },
  { pattern: "/lab/orders", module: ["Göndərilən sifarişlər", "Gələn sifarişlər"] },
  { pattern: "/technicals-report", module: "Texniklər üzrə hesabat" },

  // Stock
  { pattern: "/stock/clinic", module: "Klinikanın stoku" },
  { pattern: "/stock/cabinet", module: "Kabinet/Obyekt stoku" },
  { pattern: "/stock/import", module: "Anbara maddəxil" },
  { pattern: "/stock/order", module: "Anbara sifariş" },
  { pattern: "/stock/export", module: "Anbardan maxaric" },
  { pattern: "/stock/entry", module: "Anbardan daxilolmalar" },
  { pattern: "/stock/delete", module: "Anbardan silinmə" },
  { pattern: "/stock/usage", module: "Məhsul istifadəsi" },

  // Settings
  { pattern: "/permissions", module: "İcazələr" },
  { pattern: "/technicians", module: "Texniklər" },
  { pattern: "/appointment-types", module: "Randevu tipləri" },
  { pattern: "/checklist", module: "Müayinə siyahısı" },
  { pattern: "/operations", module: "Əməliyyat növləri" },
  { pattern: "/colors", module: "Rənglər" },
  { pattern: "/implants", module: "İmplantlar" },
  { pattern: "/dental-set", module: "Qarnirlar" },
  { pattern: "/insurance", module: "Sığorta şirkətləri" },
  { pattern: "/settings/insurance", module: "Sığorta şirkətləri" },
  { pattern: "/price-category", module: "Qiymət kateqoriyaları" },
  { pattern: "/cabinets", module: "Kabinetlər" },
  { pattern: "/recepts", module: "Reseptlər" },
  { pattern: "/anamnesis", module: "Anamnez siyahısı" },
  { pattern: "/specialities", module: "İxtisaslar" },
  { pattern: "/edit-speciality", module: "İxtisaslar" },
  { pattern: "/academic-degrees", module: "Elmi dərəcələr" },
  { pattern: "/add-degree", module: "Elmi dərəcələr" },
  { pattern: "/edit-degree", module: "Elmi dərəcələr" },
  { pattern: "/product-categories", module: "Məhsul kateqoriyaları" },
  { pattern: "/blacklist-reasons", module: "Qara siyahı səbəbləri" },
  { pattern: "/add-reason", module: "Qara siyahı səbəbləri" },
  { pattern: "/edit-reason", module: "Qara siyahı səbəbləri" },
  { pattern: "/recommendations", module: "Tövsiyə edənlər" },
  { pattern: "/other-objects", module: "Digər obyektlər" },
  { pattern: "/general-settings", module: "Ümumi tənzimləmələr" },
  { pattern: "/metals", module: "Digər" },
  { pattern: "/ceramics", module: "Digər" },
  { pattern: "/teeth", module: "Digər" },
];

const toSegments = (path) => path.split("/").filter(Boolean);

// Böyük/kiçik hərf və %-kodlaşdırma ilə guard-dan yan keçməyin qarşısını al
// (React Router path-ları case-insensitive uyğunlaşdırır).
export const normalizePath = (pathname = "") => {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // yanlış kodlaşdırma — olduğu kimi saxla
  }
  return "/" + toSegments(path.toLowerCase()).join("/");
};

const COMPILED_RULES = ROUTE_RULES.map((rule) => ({
  ...rule,
  segments: toSegments(rule.pattern.toLowerCase()),
})).sort((a, b) => b.segments.length - a.segments.length);

const matchesPrefix = (patternSegments, pathSegments) =>
  patternSegments.length <= pathSegments.length &&
  patternSegments.every((seg, i) => seg === "*" || seg === pathSegments[i]);

// add/edit səhifələri üçün tələb olunan əməliyyat
const CREATE_SEGMENT = /^(add|add-new|create)$|^add-|-add$/;
const UPDATE_SEGMENT = /^edit$|^edit-|-edit$/;

const deriveAction = (pathSegments) => {
  if (pathSegments.some((seg) => CREATE_SEGMENT.test(seg))) return "CREATE";
  if (pathSegments.some((seg) => UPDATE_SEGMENT.test(seg))) return "UPDATE";
  return "READ";
};

const isListed = (list, path) => list.some((p) => normalizePath(p) === path);

const isUnderUnguarded = (pathSegments) =>
  UNGUARDED_PATHS.some((p) => matchesPrefix(toSegments(p.toLowerCase()), pathSegments));

/**
 * Path üçün tələb olunan icazələri qaytarır:
 * - { public: true } — icazə yoxlanmır
 * - { checks: [{ modules: [...], action }] } — hamısı ödənməlidir
 * - null — naməlum route (default olaraq qadağandır)
 */
export const resolveRoutePermissions = (pathname) => {
  const path = normalizePath(pathname);
  const pathSegments = toSegments(path);
  if (isListed(PUBLIC_PATHS, path) || isUnderUnguarded(pathSegments)) {
    return { public: true };
  }

  const rule = COMPILED_RULES.find((r) => matchesPrefix(r.segments, pathSegments));
  if (!rule) return null;

  const modules = Array.isArray(rule.module) ? rule.module : [rule.module];
  const action = rule.readOnly ? "READ" : deriveAction(pathSegments);
  const checks = [{ modules, action }];
  if (rule.alsoRequire) {
    checks.push({ modules: [rule.alsoRequire], action: "READ" });
  }
  return { checks };
};

export const isPathAllowed = (pathname, hasPermission) => {
  const resolved = resolveRoutePermissions(pathname);
  if (!resolved) return false;
  if (resolved.public) return true;
  return resolved.checks.every(({ modules, action }) =>
    modules.some((module) => hasPermission(module, action))
  );
};
