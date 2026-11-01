import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import useBlackListResultStore from "../../../stores/blacklistReasonStore";
import "../../assets/style/Specialities/specialities.css";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function BlacklistReasons() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Qara siyahı səbəbləri", "CREATE");
  const canUpdate = hasPermission("Qara siyahı səbəbləri", "UPDATE");
  const canDelete = hasPermission("Qara siyahı səbəbləri", "DELETE");
  const canStatus = hasPermission("Qara siyahı səbəbləri", "STATUS");

  const {
    results,
    fetchResults,
    removeResult,
    updateResultStatus,
    loading,
    error,
  } = useBlackListResultStore();

  useEffect(() => {
    fetchResults();
  }, []);

  const dataArray = Array.isArray(results?.data) ? results.data : [];

  const filteredData = dataArray.filter((row) => {
    const matchesName = (row.statusName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? row.status === filterStatus : true;
    return matchesName && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`/edit-reason/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`"${row.statusName}" silinsin?`)) {
      await removeResult(row.id);
      await fetchResults();
    }
  };

  const toggleStatus = async (row) => {
    if (!row.id) return;
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateResultStatus(row.id, { status: newStatus });
      await fetchResults();
    } catch {
      alert("Status yenilənərkən xəta baş verdi");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Səbəb adı": row.statusName || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "qara_siyahi_sebebleri");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
              <Link className="settings-btn-add" to={"/add-reason"}>
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Səbəb adı
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
                  <td colSpan="4" className="settings-empty-state">Nəticə tapılmadı</td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.statusName}</td>
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
              Xəta: {error.message || "Serverdən cavab alınmadı"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlacklistReasons;
