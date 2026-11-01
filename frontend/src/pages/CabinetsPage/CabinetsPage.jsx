import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { CiExport } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/style/CabinetsPage/cabinetspage.css";
import useCabinetStore from "../../../stores/cabinetStore";
import "./cabinet.css";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const CabinetsPage = () => {
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Kabinetlər", "CREATE");
  const canUpdate = hasPermission("Kabinetlər", "UPDATE");
  const canDelete = hasPermission("Kabinetlər", "DELETE");
  const canStatus = hasPermission("Kabinetlər", "STATUS");

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { cabinets, fetchCabinets, deleteCabinet, updateStatus, loading } =
    useCabinetStore();

  useEffect(() => {
    fetchCabinets();
  }, []);

  const filteredCabinetItems = cabinets.filter(
    (item) =>
      (status === "" || item.status === status) &&
      (item.cabinetName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      deleteCabinet(id);
    }
  };

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    const statusData = { id, status: newStatus };
    updateStatus(statusData);
  };

  const handleExport = () => {
    const dataToExport = filteredCabinetItems.map((item, idx) => ({
      "№": idx + 1,
      "Kabinetin adı": item.cabinetName || "",
      "Status": item.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "kabinetler_siyahisi");
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
                <th>
                  <div className="flex items-center gap-2">
                    <HiArrowsUpDown className="text-gray-400" /> Kabinetin adı
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
                  <td colSpan="4" className="settings-empty-state">Yüklənir...</td>
                </tr>
              ) : filteredCabinetItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="settings-empty-state">Nəticə tapılmadı</td>
                </tr>
              ) : (
                filteredCabinetItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="settings-col-num">{idx + 1}</td>
                    <td className="font-medium text-gray-800">{item.cabinetName}</td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          item.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() =>
                          canStatus && handleStatusToggle(item.id, item.status)
                        }
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

export default CabinetsPage;
