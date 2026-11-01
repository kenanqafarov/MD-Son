import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import "../../assets/style/Specialities/specialities.css";
import useSpecializationStore from "../../../stores/useSpecializationStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function Specialities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("İxtisaslar", "CREATE");
  const canUpdate = hasPermission("İxtisaslar", "UPDATE");
  const canDelete = hasPermission("İxtisaslar", "DELETE");
  const canStatus = hasPermission("İxtisaslar", "STATUS");

  const { 
    specializations, 
    loading, 
    error, 
    fetchSpecializations, 
    editSpecialization,
    removeSpecialization 
  } = useSpecializationStore();

  useEffect(() => {
    fetchSpecializations();
  }, [fetchSpecializations]);

  const filteredData = (specializations || []).filter((specialization) => {
    const nameMatch = (specialization.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "" || (specialization.status || "").toLowerCase() === filterStatus.toLowerCase();
    return nameMatch && statusMatch;
  });

  const handleEdit = (row) => {
    navigate(`/edit-speciality/${row.id}`);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Siz "${name}" ixtisasını silməyə əminsiniz?`)) {
      try {
        await removeSpecialization(id);
      } catch (err) {
        alert(`"${name}" ixtisası silinərkən xəta baş verdi.`);
        console.error("Silinmə xətası:", err);
      }
    }
  };

  const handleStatusToggle = async (row) => {
    const newStatus = (row.status || "").toUpperCase() === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await editSpecialization({ id: row.id, name: row.name, status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilərkən xəta baş verdi.");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "İxtisasın adı": row.name || "",
      "Status": (row.status || "").toUpperCase() === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "ixtisaslar_siyahisi");
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
              <Link className="settings-btn-add" to={'add'}>
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> İxtisasın adı
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
                  <td colSpan="4" className="settings-empty-state">Heç bir ixtisas tapılmadı.</td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const isActive = (row.status || "").toUpperCase() === "ACTIVE";
                  return (
                    <tr key={row.id}>
                      <td className="settings-col-num">{index + 1}</td>
                      <td className="font-medium text-gray-800">{row.name}</td>
                      <td>
                        <button
                          type="button"
                          disabled={!canStatus}
                          className={`settings-status-badge ${
                            isActive
                              ? "settings-status-active"
                              : "settings-status-passive"
                          }`}
                          onClick={() => canStatus && handleStatusToggle(row)}
                        >
                          <span className="settings-status-dot" />
                          {isActive ? "Aktiv" : "Passiv"}
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
                                onClick={() => handleDelete(row.id, row.name)}
                                title="Sil"
                              >
                                <GoTrash size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mt-2">
              Xəta: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Specialities;