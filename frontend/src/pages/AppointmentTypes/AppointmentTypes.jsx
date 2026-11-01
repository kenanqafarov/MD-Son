import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import "../../assets/style/AppointmentTypes/appointmenttypes.css";
import { CiExport } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import useAppointmentTypeStore from "../../../stores/appointment-type-store";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const AppointmentTypes = () => {
  const {
    appointmentTypes = [],
    loading,
    error,
    fetchAppointmentTypes,
    removeAppointmentType,
    updateAppointmentTypeStatus,
  } = useAppointmentTypeStore();

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Randevu tipləri", "CREATE");
  const canUpdate = hasPermission("Randevu tipləri", "UPDATE");
  const canDelete = hasPermission("Randevu tipləri", "DELETE");
  const canStatus = hasPermission("Randevu tipləri", "STATUS");

  useEffect(() => {
    fetchAppointmentTypes();
  }, [fetchAppointmentTypes]);

  const filteredAppointmentTypes = (appointmentTypes || []).filter(
    (type) =>
      (status === "" || (type?.status || "") === status) &&
      (type?.appointmentTypeName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu randevu tipini silmək istədiyinizə əminsinizmi?")) {
      await removeAppointmentType(id);
    }
  };

  const toggleStatus = async (type) => {
    if (!updateAppointmentTypeStatus) return;

    const newStatus = type.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";

    await updateAppointmentTypeStatus({ id: type.id, status: newStatus });
  };

  const handleExport = () => {
    const dataToExport = filteredAppointmentTypes.map((type, idx) => ({
      "№": idx + 1,
      "Randevu tipinin adı": type.appointmentTypeName || "",
      "Müddət (dəqiqə)": type.duration || "",
      "Rəng": type.color || "",
      "Status": type.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "randevu_tipleri");
  };

  const handleSearch = async () => {
    if (search.trim()) {
    } else {
      await fetchAppointmentTypes();
    }
  };

  if (loading)
    return (
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
          <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
        </div>
      </div>
    );
  if (error) return <div>Error: {error.message || error.toString()}</div>;

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="settings-search-wrapper">
              <CiSearch className="settings-search-icon" />
              <input
                type="text"
                placeholder="Axtarış"
                className="settings-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="settings-right-controls">
            {canCreate && (
              <Link to={"add"} className="settings-btn-add">
                <span>+</span> Yenisini əlavə et
              </Link>
            )}
            <button
              type="button"
              className="settings-btn-export"
              title="Excel-ə ixrac et"
              onClick={handleExport}
            >
              <CiExport size={20} />
            </button>
          </div>
        </div>

        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th className="settings-col-num">№</th>
                <th>Randevu tipinin adı</th>
                <th>Müddət</th>
                <th>Status</th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>

            <tbody>
              {filteredAppointmentTypes.length > 0 ? (
                filteredAppointmentTypes.map((type, idx) => (
                  <tr key={type?.id || idx}>
                    <td className="settings-col-num">{idx + 1}</td>
                    <td style={{ fontWeight: 500, color: "#1E293B" }}>{type?.appointmentTypeName || ""}</td>
                    <td>{type?.time ? type.time.slice(0, 5) : type?.duration ? `${type.duration} dəq` : "—"}</td>
                    <td>
                      <span
                        onClick={() => canStatus && toggleStatus(type)}
                        className={`settings-status-badge ${
                          (type?.status || "") === "ACTIVE" ? "active" : "passive"
                        }`}
                        style={{ cursor: canStatus ? "pointer" : "default" }}
                        title="Statusu dəyişmək üçün kliklə"
                      >
                        <span className="settings-status-dot" />
                        {(type?.status || "") === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(type?.id)}
                              title="Düzəliş et"
                            >
                              <FiEdit3 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(type?.id)}
                              title="Sil"
                            >
                              <GoTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="settings-empty-state">Heç bir randevu tipi tapılmadı.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTypes;
