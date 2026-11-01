import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiBox,
  FiFileText,
  FiDollarSign,
  FiUserPlus,
  FiClock,
  FiArrowRight,
  FiCheckCircle,
  FiActivity,
  FiShield,
} from "react-icons/fi";
import useAuthStore from "../../../stores/authStore";
import useWorkerStore from "../../../stores/workerStore";
import usePatientStore from "../../../stores/patiendStore";
import useGeneralCalendarStore from "../../../stores/appointments";

const Home = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { workers, fetchWorkers } = useWorkerStore();
  const { patients, fetchPatients } = usePatientStore();
  const { appointments, fetchAllAppointments } = useGeneralCalendarStore();

  useEffect(() => {
    fetchWorkers();
    fetchPatients();
    fetchAllAppointments();
  }, [fetchWorkers, fetchPatients, fetchAllAppointments]);

  // Determine user roles
  const permissions = user?.permissions || [];
  const isSuperAdmin = permissions.includes("SUPER_ADMIN") || user?.username === "admin";
  const isAccountant =
    permissions.some((p) => {
      const pStr = typeof p === "string" ? p.toLowerCase() : "";
      return pStr.includes("hesabat") || pStr.includes("mühasib") || pStr.includes("kassa") || pStr.includes("maliyyə");
    });
  const isDoctor =
    permissions.some((p) => {
      const pStr = typeof p === "string" ? p.toLowerCase() : "";
      return pStr.includes("həkim") || pStr.includes("stomatoloq");
    });

  const displayName = user?.name ? `${user.name} ${user?.surname || ""}`.trim() : user?.username || "İstifadəçi";

  const roleTitle = isSuperAdmin
    ? "Baş Administrator"
    : isAccountant
    ? "Mühasibatlıq və Maliyyə Şöbəsi"
    : isDoctor
    ? "Həkim / Stomatoloq"
    : permissions[0] || "Əməkdaş";

  const todayStr = new Date().toLocaleDateString("az-AZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto w-full min-h-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}>
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
              <FiShield /> {roleTitle}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Salam, {displayName}! 👋
            </h1>
            <p className="text-blue-100 text-sm mt-1 capitalize font-medium">
              {todayStr} • Modern Dentistry İdarəetmə Paneli
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => navigate("/employees/employee-add")}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition">
                <FiUserPlus size={16} /> Yeni İşçi
              </button>
            )}
            <button
              onClick={() => navigate("/appointments/add")}
              className="bg-blue-900/60 hover:bg-blue-900/80 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition">
              <FiCalendar size={16} /> Randevu Təyin Et
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Workers stat */}
        <div
          onClick={() => navigate("/employees")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">İşçilər</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{workers?.length || 0}</div>
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <FiCheckCircle size={12} /> {workers?.filter((w) => w.enabled)?.length || 0} aktiv əməkdaş
            </div>
          </div>
        </div>

        {/* Patients stat */}
        <div
          onClick={() => navigate("/patients")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-pointer group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pasientlər</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiActivity size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{patients?.length || 0}</div>
            <div className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1">
              Qeydiyyatda olan pasientlər
            </div>
          </div>
        </div>

        {/* Appointments stat */}
        <div
          onClick={() => navigate("/appointments")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition cursor-pointer group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Randevular</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiCalendar size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{appointments?.length || 0}</div>
            <div className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              Planlaşdırılmış qəbullar
            </div>
          </div>
        </div>

        {/* Stock / Finance stat */}
        <div
          onClick={() => navigate(isAccountant ? "/reports" : "/stock/clinic")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition cursor-pointer group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isAccountant ? "Hesabatlar" : "Klinika Anbarı"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isAccountant ? <FiTrendingUp size={20} /> : <FiBox size={20} />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {isAccountant ? "Aktiv" : "Stok"}
            </div>
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              {isAccountant ? "Maliyyə hesabatına keç" : "Məhsul və materiallar"}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Sections */}
      {isAccountant ? (
        /* ACCOUNTANT VIEW: Reports and Financials */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiFileText className="text-blue-600" /> Maliyyə və Qəbz Hesabatları
              </h2>
              <button
                onClick={() => navigate("/reports")}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Bütün hesabatlar <FiArrowRight />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Gəlirlər, xərclər, sığorta əməliyyatları və pasient kassa ödənişlərinin icmalı.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => navigate("/reports")}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer">
                <div className="text-sm font-semibold text-slate-800 mb-1">Gündəlik Kassa Hesabatı</div>
                <p className="text-xs text-slate-500">Gündəlik daxilolmalar və müalicə ödənişləri</p>
              </div>
              <div
                onClick={() => navigate("/insurance")}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer">
                <div className="text-sm font-semibold text-slate-800 mb-1">Sığorta Şirkətləri</div>
                <p className="text-xs text-slate-500">Sığorta limitləri və ödənilən qalıqlar</p>
              </div>
              <div
                onClick={() => navigate("/price-category")}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer">
                <div className="text-sm font-semibold text-slate-800 mb-1">Qiymət Kateqoriyaları</div>
                <p className="text-xs text-slate-500">Klinika xidmətlərinin rəsmi qiymət cədvəli</p>
              </div>
              <div
                onClick={() => navigate("/technicals-report")}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer">
                <div className="text-sm font-semibold text-slate-800 mb-1">Texniklər üzrə Hesabat</div>
                <p className="text-xs text-slate-500">Laboratoriya sifarişləri və xərclər</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FiDollarSign className="text-emerald-600" /> Borclu Pasientlər
              </h3>
              <p className="text-xs text-slate-500 mb-4">Ödənişini gözləyən aktiv pasient borcları</p>
              <div className="space-y-3">
                {patients?.filter((p) => p.debt > 0).slice(0, 4).map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2.5 rounded-lg bg-red-50/60 border border-red-100">
                    <span className="text-xs font-semibold text-slate-800">{p.name} {p.surname}</span>
                    <span className="text-xs font-bold text-red-600">{p.debt} AZN</span>
                  </div>
                ))}
                {(!patients || patients.filter((p) => p.debt > 0).length === 0) && (
                  <p className="text-xs text-emerald-600 font-medium">Bütün pasient borcları ödənilib.</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/patients")}
              className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition">
              Pasientlərə bax
            </button>
          </div>
        </div>
      ) : (
        /* ADMIN & DOCTOR VIEW: Employees & Appointments Focus */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Employees List preview (Addresses user request: "employees göstərsin misal") */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiUsers className="text-blue-600" /> Klinika Əməkdaşları
              </h2>
              <button
                onClick={() => navigate("/employees")}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Hamısına bax <FiArrowRight />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-medium">
                    <th className="pb-3 font-semibold">İşçi</th>
                    <th className="pb-3 font-semibold">İcazələr</th>
                    <th className="pb-3 font-semibold">Telefon</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers?.slice(0, 5).map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/employees/employee/${emp.id}`)}
                      className="hover:bg-slate-50 transition cursor-pointer">
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={
                            emp.profilePhotoPath ||
                            `https://avatar.iran.liara.run/username?username=${emp.name}+${emp.surname}`
                          }
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-800">{emp.name} {emp.surname}</div>
                          <div className="text-xs text-slate-400">@{emp.username}</div>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-slate-600">
                        {emp.permissions?.join(", ") || "Standart"}
                      </td>
                      <td className="py-3 text-xs text-slate-600">{emp.phone || "-"}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            emp.enabled
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                          {emp.enabled ? "Aktiv" : "Passiv"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!workers || workers.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                        Hələ heç bir işçi əlavə edilməyib
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule / Shortcuts side card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FiClock className="text-indigo-600" /> Sürətli Keçidlər
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate("/employees/employee-schedule")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <FiCalendar className="text-indigo-600" /> İş qrafiki cədvəli
                  </span>
                  <FiArrowRight size={14} className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/appointments")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <FiClock className="text-blue-600" /> Ümumi təqvim və randevular
                  </span>
                  <FiArrowRight size={14} className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/patients")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <FiUsers className="text-emerald-600" /> Pasient qeydiyyatı
                  </span>
                  <FiArrowRight size={14} className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/stock/clinic")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <FiBox className="text-amber-600" /> Klinikanın anbar stoku
                  </span>
                  <FiArrowRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 text-center">
                Modern Dentistry Clinic • Version 2.0
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Home;