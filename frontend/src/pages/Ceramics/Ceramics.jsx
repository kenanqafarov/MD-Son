import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import "../../assets/style/Ceramics/ceramics.css";
import useCeramicsStore from "../../../stores/ceramicStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function Ceramics() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Digər", "CREATE");
  const canUpdate = hasPermission("Digər", "UPDATE");
  const canDelete = hasPermission("Digər", "DELETE");
  const canStatus = hasPermission("Digər", "STATUS");

  const {
    ceramics,
    fetchCeramics,
    deleteCeramic,
    updateCeramicStatus,
    loading,
    error,
  } = useCeramicsStore();

  useEffect(() => {
    fetchCeramics();
  }, [fetchCeramics]);

  const searchLower = searchTerm.toLowerCase();

  const filteredData = Array.isArray(ceramics)
    ? ceramics.filter(({ name, status }) => {
        const nameLower = name ? name.toLowerCase() : "";
        return (
          nameLower.includes(searchLower) &&
          (statusFilter ? status === statusFilter : true)
        );
      })
    : [];

  const handleEdit = (row) => {
    navigate(`../ceramics/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`"${row.name}" silinsin?`)) {
      try {
        await deleteCeramic(row.id);
      } catch {
        alert("Silinərkən xəta baş verdi");
      }
    }
  };

  const toggleStatus = async (row) => {
    if (!row.id) return;
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateCeramicStatus(row.id, { status: newStatus });
      await fetchCeramics();
    } catch {
      alert("Status yenilənərkən xəta baş verdi");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Keramikanın adı": row.name || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "keramikalar_siyahisi");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <Link className="settings-btn-add" to="add">
                <span>+</span> Yenisini əlavə et
              </Link>
            )}
            <button
              type="button"
              className="settings-btn-export"
              title="Excel-ə ixrac et"
              onClick={handleExport}
            >
              <FiDownload size={18} />
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Keramikanın adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Status
                  </div>
                </th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="settings-empty-state">Yüklənir...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="settings-empty-state">Məlumat tapılmadı</td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.name}</td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          row.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() => canStatus && toggleStatus(row)}
                      >
                        <span className="settings-status-dot" />
                        {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </button>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(row)}
                              title="Redaktə et"
                            >
                              <FiEdit3 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(row)}
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
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mt-2">
              Xəta: {error?.message || "Naməlum xəta baş verdi"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ceramics;
