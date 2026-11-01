import React, { useEffect, useState } from "react";
import "../../assets/style/Operations/operationcategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import useOperationTypesStore from "../../../stores/operationsTypeStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const OperationCategoryList = () => {
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Əməliyyat növləri", "CREATE");
  const canUpdate = hasPermission("Əməliyyat növləri", "UPDATE");
  const canDelete = hasPermission("Əməliyyat növləri", "DELETE");
  const canStatus = hasPermission("Əməliyyat növləri", "STATUS");
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Store-dan state və funksiyaları çəkmək
  const {
    operationTypes,
    loading,
    error,
    fetchAll,
    remove,
    updateStatus // 🔥 Status dəyişmə funksiyası
  } = useOperationTypesStore();

  // Komponent mount olanda data yüklə
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filtered data
  const filteredOperationTypes = operationTypes.filter((operation) => {
    const matchesSearch = operation.categoryName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "" || operation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id) => {
    navigate(`/operations/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Əməliyyat kateqoriyasını silmək istədiyinizə əminsiniz?")) {
      try {
        await remove(id);
      } catch (err) {
        alert("Silərkən xəta baş verdi!");
      }
    }
  };

  // ✅ STATUS DƏYİŞMƏ FUNKSİYASI
  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(row.id, { status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  // Status formatlama
  const formatStatus = (status) => {
    if (!status) return "";
    if (status.toUpperCase() === "ACTIVE") return "Aktiv";
    if (status.toUpperCase() === "PASSIVE") return "Passiv";
    return status;
  };

  const handleExport = () => {
    const dataToExport = filteredOperationTypes.map((row, index) => ({
      "№": index + 1,
      "Əməliyyat kateqoriyasının adı": row.categoryName || "",
      "Status": formatStatus(row.status),
    }));
    exportToExcel(dataToExport, "emeliyyat_kateqoriyalari");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Status</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="PASSIVE">Passiv</option>
            </select>
            <div className="settings-search-wrapper">
              <CiSearch className="settings-search-icon" />
              <input
                type="text"
                placeholder="Axtarış"
                className="settings-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-right-controls">
            {canCreate && (
              <Link to={"./add"} className="settings-btn-add">
                <span>+</span> Yenisini əlavə et
              </Link>
            )}
            <button
              type="button"
              className="settings-btn-export"
              onClick={handleExport}
              title="Excel-ə ixrac et"
            >
              <FiDownload size={18} />
            </button>
          </div>
        </div>

        <div className="settings-table-wrapper">
          {loading ? (
            <div className="settings-empty-state">Yüklənir...</div>
          ) : error ? (
            <div className="settings-empty-state" style={{ color: "#DC2626" }}>
              Xəta: {error.message || error.toString()}
            </div>
          ) : filteredOperationTypes.length === 0 ? (
            <div className="settings-empty-state">Məlumat tapılmadı.</div>
          ) : (
            <table className="settings-table">
              <thead>
                <tr>
                  <th className="settings-col-num">№</th>
                  <th>Kateqoriyanın adı</th>
                  <th>Əməliyyatların sayı</th>
                  <th>Status</th>
                  {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOperationTypes.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td style={{ fontWeight: 500, color: "#1E293B" }}>{row.categoryName}</td>
                    <td>
                      <Link
                        to={`/operations/${row.id}`}
                        style={{ color: "#155EEF", fontWeight: 500, textDecoration: "none" }}
                        onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                      >
                        Əməliyyatların sayı ({row.opTypeItemCount || 0})
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`settings-status-badge ${
                          row.status === "ACTIVE" ? "active" : "passive"
                        }`}
                        onClick={() => canStatus && handleStatusToggle(row)}
                        style={{ cursor: canStatus ? "pointer" : "default" }}
                        title="Statusu dəyişmək üçün klikləyin"
                      >
                        <span className="settings-status-dot" />
                        {formatStatus(row.status)}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(row.id)}
                              title="Düzəliş et"
                            >
                              <FiEdit3 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(row.id)}
                              title="Sil"
                            >
                              <GoTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationCategoryList;
