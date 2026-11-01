import React, { useEffect, useState } from "react";
import { CiSearch, CiExport } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import "../../assets/style/PriceCategory/pricecategory.css";
import { Link, useNavigate } from "react-router-dom";
import usePriceCategoryStore from "../../../stores/priceCategoryStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const PriceCategory = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Qiymət kateqoriyaları", "CREATE");
  const canUpdate = hasPermission("Qiymət kateqoriyaları", "UPDATE");
  const canDelete = hasPermission("Qiymət kateqoriyaları", "DELETE");
  const canStatus = hasPermission("Qiymət kateqoriyaları", "STATUS");

  const {
    categories,
    loading,
    fetchCategories,
    removeCategory,
    updateCategoryStatus,
  } = usePriceCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz?")) {
      removeCategory(id);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateCategoryStatus(item.id, { status: newStatus });
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  const filteredCategories = categories.filter(
    (item) =>
      (status === "" || item.status === status) &&
      (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const dataToExport = filteredCategories.map((item, idx) => ({
      "№": idx + 1,
      "Kateqoriya adı": item.name || "",
      "Status": item.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "qiymet_kateqoriyalari");
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
                <th className="settings-col-num">#</th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiArrowsUpDown className="text-gray-400" /> Kateqoriya adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiArrowsUpDown className="text-gray-400" /> Status
                  </div>
                </th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="settings-empty-state">Yüklənir...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="settings-empty-state">Heç bir nəticə tapılmadı</td>
                </tr>
              ) : (
                filteredCategories.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="settings-col-num">{idx + 1}</td>
                    <td className="font-medium text-gray-800">{item.name}</td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          item.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() => canStatus && handleStatusToggle(item)}
                      >
                        <span className="settings-status-dot" />
                        {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </button>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(item.id)}
                              title="Redaktə et"
                            >
                              <FiEdit3 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(item.id)}
                              title="Sil"
                            >
                              <GoTrash size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceCategory;
