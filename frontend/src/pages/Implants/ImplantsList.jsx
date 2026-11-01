import React, { useEffect, useState } from "react";
import "../../assets/style/Implants/implantslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import useImplantStore from "../../../stores/implantStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const ImplantsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("İmplantlar", "CREATE");
  const canUpdate = hasPermission("İmplantlar", "UPDATE");
  const canDelete = hasPermission("İmplantlar", "DELETE");
  const canStatus = hasPermission("İmplantlar", "STATUS");

  const { implants, fetchImplants, removeImplant, changeStatus, loading } =
    useImplantStore();

  useEffect(() => {
    fetchImplants();
  }, []);

  const filteredImplants = implants.filter((row) => {
    return (
      (row.implantBrandName || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter ? row.status === statusFilter : true)
    );
  });

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    const confirmMessage =
      newStatus === "ACTIVE"
        ? "İmplantı aktiv etmək istəyirsiniz?"
        : "İmplantı passiv etmək istəyirsiniz?";

    if (window.confirm(confirmMessage)) {
      await changeStatus(id, newStatus);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      await removeImplant(id);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredImplants.map((row, idx) => ({
      "№": idx + 1,
      "İmplant markası": row.implantBrandName || "",
      "Ölçü sayı": row.implantSizesReads?.length || 0,
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "implantlar_siyahisi");
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Marka
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Ölçülər
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
                  <td colSpan="5" className="settings-empty-state">Yüklənir...</td>
                </tr>
              ) : filteredImplants.length > 0 ? (
                filteredImplants.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.implantBrandName}</td>
                    <td>
                      <Link
                        to={`./sizes/${row.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Ölçüləri ({row.implantSizesReads?.length || 0})
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          row.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() => canStatus && handleStatusChange(row.id, row.status)}
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
                              onClick={() => navigate(`/implants/edit/${row.id}`)}
                              title="Redaktə et"
                            >
                              <FiEdit3 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(row.id)}
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
              ) : (
                <tr>
                  <td colSpan="5" className="settings-empty-state">Heç bir implant tapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImplantsList;
