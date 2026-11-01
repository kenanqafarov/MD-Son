import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import "../../assets/style/Metals/metals.css";
import useMetalStore from "../../../stores/metalsStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function Metal() {
  const navigate = useNavigate();
  const { metals, fetchMetals, deleteMetal, updateMetalStatus, loading, error } = useMetalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Digər", "CREATE");
  const canUpdate = hasPermission("Digər", "UPDATE");
  const canDelete = hasPermission("Digər", "DELETE");
  const canStatus = hasPermission("Digər", "STATUS");

  useEffect(() => {
    fetchMetals();
  }, [fetchMetals]);

  const toggleStatus = async (metal) => {
    const newStatus = metal.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    await updateMetalStatus(metal.id, { status: newStatus });
  };

  const filteredData = (metals || []).filter((metal) => {
    const name = metal.name?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const nameMatches = name.includes(search);
    const statusMatches = statusFilter ? metal.status === statusFilter : true;
    return nameMatches && statusMatches;
  });

  const handleEdit = (metal) => {
    navigate(`/metals/edit/${metal.id}`);
  };

  const handleDelete = async (metal) => {
    if (window.confirm(`${metal.name} silinsin?`)) {
      await deleteMetal(metal.id);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((metal, idx) => ({
      "№": idx + 1,
      "Metalın adı": metal.name || "",
      "Status": metal.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "metallar_siyahisi");
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
              <Link className="settings-btn-add" to={"add"}>
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
          <table className="settings-table">
            <thead>
              <tr>
                <th className="settings-col-num">#</th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Metalın adı
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
                filteredData.map((metal, index) => (
                  <tr key={metal.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{metal.name}</td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          metal.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() => canStatus && toggleStatus(metal)}
                      >
                        <span className="settings-status-dot" />
                        {metal.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </button>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(metal)}
                              title="Redaktə et"
                            >
                              <FiEdit3 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(metal)}
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
              Xəta baş verdi: {error.message || error.toString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Metal;
