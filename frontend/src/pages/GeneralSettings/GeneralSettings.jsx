import React, { useState, useEffect } from "react";
import { FiEdit3, FiClock, FiCalendar, FiCheckCircle, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const GeneralSettings = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("clinic_settings") || "{}");
      return {
        sampleCheck: saved.sampleCheck !== undefined ? saved.sampleCheck : true,
        startTime: saved.startTime || "09:00",
        endTime: saved.endTime || "23:00",
        interval: saved.interval || "15",
        diagnosisItems: saved.diagnosisItems || ["Müayinə", "14"],
        labItems: saved.labItems || ["Endodontiya - 1Perio lateral"],
      };
    } catch {
      return {
        sampleCheck: true,
        startTime: "09:00",
        endTime: "23:00",
        interval: "15",
        diagnosisItems: ["Müayinə", "14"],
        labItems: ["Endodontiya - 1Perio lateral"],
      };
    }
  });

  const toggleSampleCheck = () => {
    const updated = { ...settings, sampleCheck: !settings.sampleCheck };
    setSettings(updated);
    localStorage.setItem("clinic_settings", JSON.stringify(updated));
  };

  const handleEdit = () => {
    navigate("./edit");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Ümumi tənzimləmələr
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Klinika iş rejimi, təqvim vaxtları və standart müayinə parametrləri
          </p>
        </div>
        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition duration-150 cursor-pointer w-fit"
        >
          <FiEdit3 className="text-base" />
          <span>Redaktə et</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Working Hours Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FiClock className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Təqvim və İş Vaxtları</h2>
              <p className="text-xs text-slate-400">Pasiyent qəbulu və rezervasiya saatları</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Başlama saatı</span>
              <span className="text-sm font-semibold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {settings.startTime}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Bitiş saatı</span>
              <span className="text-sm font-semibold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {settings.endTime}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Qəbul intervalı</span>
              <span className="text-sm font-semibold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {settings.interval} dəqiqə
              </span>
            </div>
          </div>
        </div>

        {/* Verification & Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiCheckCircle className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Sistem və Yoxlama</h2>
              <p className="text-xs text-slate-400">Avtomatik yoxlama və status parametrləri</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Nümunə Check</p>
                <p className="text-xs text-slate-400">Sistem yoxlama statusunu idarə edin</p>
              </div>
              <button
                type="button"
                onClick={toggleSampleCheck}
                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold transition ${
                  settings.sampleCheck
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                }`}
              >
                {settings.sampleCheck ? "Aktiv" : "Passiv"}
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Items Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiActivity className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Diaqnoz üçün müayinələr</h2>
              <p className="text-xs text-slate-400">Müayinə və ilkin diaqnostika növləri</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.diagnosisItems && settings.diagnosisItems.length > 0 ? (
              settings.diagnosisItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">Heç bir müayinə təyin edilməyib</span>
            )}
          </div>
        </div>

        {/* Lab Operations Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <FiCalendar className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Laboratoriya üçün əməliyyatlar</h2>
              <p className="text-xs text-slate-400">Laboratoriya sifarişləri üçün seçilən əməliyyatlar</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.labItems && settings.labItems.length > 0 ? (
              settings.labItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">Heç bir laboratoriya əməliyyatı təyin edilməyib</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;