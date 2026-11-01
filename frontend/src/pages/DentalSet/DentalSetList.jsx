import { Link, useNavigate } from "react-router-dom";
import "../../assets/style/DentalSet/dentalsetlist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { useEffect, useState } from "react";
import useGarnitureStore from "../../../stores/garnitureStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function DentalSetList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Qarnirlar", "CREATE");
  const canUpdate = hasPermission("Qarnirlar", "UPDATE");
  const canDelete = hasPermission("Qarnirlar", "DELETE");
  const canStatus = hasPermission("Qarnirlar", "STATUS");

  const {
    garnitures,
    fetchGarnitures,
    removeGarniture,
    updateStatus,
    loading,
    error,
  } = useGarnitureStore();

  useEffect(() => {
    fetchGarnitures();
  }, []);

  const filteredData = (garnitures || []).filter((row) => {
    const matchesName = (row.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? (row.status || "").toUpperCase() === statusFilter.toUpperCase()
      : true;
    return matchesName && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.name} qarniturunu silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeGarniture(row.id);
    } catch (err) {
      alert("Silinmə zamanı xəta baş verdi!");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const isCurrentlyActive = (currentStatus || "").toUpperCase() === "ACTIVE";
    const newStatus = isCurrentlyActive ? "PASSIVE" : "ACTIVE";
    const confirmMessage =
      newStatus === "ACTIVE"
        ? "Qarnituru aktiv etmək istədiyinizə əminsiniz?"
        : "Qarnituru passiv etmək istədiyinizə əminsiniz?";

    if (window.confirm(confirmMessage)) {
      try {
        await updateStatus(id, { status: newStatus });
      } catch (error) {
        alert("Status dəyişdirilməsi zamanı xəta baş verdi!");
      }
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Qarniturun adı": row.name || "",
      "Status": (row.status || "").toUpperCase() === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "qarniturlar_siyahisi");
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
          <table className="settings-table">
            <thead>
              <tr>
                <th className="settings-col-num">№</th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Qarniturun adı
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
              ) : filteredData.length > 0 ? (
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
                          onClick={() => canStatus && handleStatusChange(row.id, row.status)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="settings-empty-state">Heç bir qarnitur tapılmadı</td>
                </tr>
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

export default DentalSetList;
