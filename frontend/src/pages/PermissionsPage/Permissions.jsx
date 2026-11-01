import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { MdInfoOutline } from "react-icons/md";
import { CiCircleInfo } from "react-icons/ci";

// Style
import "../../assets/style/PermissionPage/permissionslist.css";

// Libraries
import { Link } from "react-router-dom";

// Store
import usePermissionStore from "../../../stores/permissionStore";
import { usePermission } from "../../hooks/usePermission";

import { exportToExcel } from "../../utils/exportExcel";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

function Permissions() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("İcazələr", "CREATE");
  const canUpdate = hasPermission("İcazələr", "UPDATE");
  const canDelete = hasPermission("İcazələr", "DELETE");
  const canStatus = hasPermission("İcazələr", "STATUS");

  const {
    permissions,
    fetchPermissions,
    updatePermissionStatus,
    deletePermission,
    loading,
    error,
  } = usePermissionStore();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const filteredData = permissions.filter(
    (row) =>
      (status === "" || row.status === status) &&
      row.permissionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updatePermissionStatus({
        id: row.id,
        status: newStatus,
      });
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };
  const handleEdit = (row) => {
    navigate(`edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `"${row.permissionName}" icazəsini silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await deletePermission(row.id);
    } catch (error) {
      alert("Silinmə zamanı xəta baş verdi.");
    }
  };

  const handleInfo = (row) => {
    navigate(`info/${row.id}`);
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, index) => ({
      "№": index + 1,
      "İcazənin adı": row.permissionName || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "icazeler");
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
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
          {loading ? (
            <div className="settings-empty-state">Yüklənir...</div>
          ) : error ? (
            <div className="settings-empty-state" style={{ color: "#DC2626" }}>Xəta: {error}</div>
          ) : filteredData.length === 0 ? (
            <div className="settings-empty-state">Məlumat tapılmadı.</div>
          ) : (
            <table className="settings-table">
              <thead>
                <tr>
                  <th className="settings-col-num">№</th>
                  <th>İcazənin adı</th>
                  <th>Status</th>
                  <th className="settings-col-actions">Düzəliş</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.id} onClick={() => handleInfo(row)} style={{ cursor: "pointer" }}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td style={{ fontWeight: 500, color: "#1E293B" }}>{row.permissionName}</td>
                    <td>
                      <span
                        className={`settings-status-badge ${
                          row.status === "ACTIVE" ? "active" : "passive"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          canStatus && handleStatusToggle(row);
                        }}
                        style={{ cursor: canStatus ? "pointer" : "default" }}
                      >
                        <span className="settings-status-dot" />
                        {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </span>
                    </td>
                    <td className="settings-col-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="settings-actions-group">
                        <button
                          type="button"
                          className="settings-action-btn info"
                          onClick={() => handleInfo(row)}
                          title="Ətraflı"
                        >
                          <CiCircleInfo size={18} />
                        </button>
                        {canUpdate && (
                          <button
                            type="button"
                            className="settings-action-btn edit"
                            onClick={() => handleEdit(row)}
                            title="Düzəliş et"
                          >
                            <FiEdit3 size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="settings-action-btn delete"
                            onClick={() => handleDelete(row)}
                            title="Sil"
                          >
                            <GoTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Permissions;
