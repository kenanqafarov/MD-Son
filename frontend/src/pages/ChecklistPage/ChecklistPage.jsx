import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import "../../assets/style/ChecklistPage/checklistpage.css";
import { Link, useNavigate } from "react-router-dom";
import useExaminationStore from "../../../stores/examinationStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const ChecklistPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Müayinə siyahısı", "CREATE");
  const canUpdate = hasPermission("Müayinə siyahısı", "UPDATE");
  const canDelete = hasPermission("Müayinə siyahısı", "DELETE");
  const canStatus = hasPermission("Müayinə siyahısı", "STATUS");

  const {
    examinations,
    fetchAllExaminations,
    deleteExamination,
    updateExaminationStatus,
  } = useExaminationStore();

  useEffect(() => {
    fetchAllExaminations();
  }, []);

  const filteredChecklistItems = examinations.filter(
    (item) =>
      (status === "" || item.status === status) &&
      item.typeName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      await deleteExamination(id);
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    await updateExaminationStatus({
      id: item.id,
      typeName: item.typeName,
      status: newStatus,
    });
  };

  const handleExport = () => {
    const dataToExport = filteredChecklistItems.map((item, idx) => ({
      "№": idx + 1,
      "Müayinə növünün adı": item.typeName || "",
      "Status": item.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "muayine_siyahisi");
  };

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
                <th>Müayinə növünün adı</th>
                <th>Status</th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {filteredChecklistItems.length > 0 ? (
                filteredChecklistItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="settings-col-num">{idx + 1}</td>
                    <td style={{ fontWeight: 500, color: "#1E293B" }}>{item.typeName}</td>
                    <td>
                      <span
                        className={`settings-status-badge ${
                          item.status === "ACTIVE" ? "active" : "passive"
                        }`}
                        style={{ cursor: canStatus ? "pointer" : "default" }}
                        onClick={() => canStatus && toggleStatus(item)}
                        title="Statusu dəyişmək üçün kliklə"
                      >
                        <span className="settings-status-dot" />
                        {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(item.id)}
                              title="Düzəliş et"
                            >
                              <FiEdit3 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(item.id)}
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
                  <td colSpan={4}>
                    <div className="settings-empty-state">Heç bir müayinə tapılmadı.</div>
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

export default ChecklistPage;
