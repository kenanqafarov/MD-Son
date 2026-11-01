import React, { useEffect, useState } from "react";
import "../../assets/style/Anamnesis/anamnesiscategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAnamnesisListStore from "../../../stores/anamnesStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const AnamnesisList = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Anamnez siyahısı", "CREATE");
  const canUpdate = hasPermission("Anamnez siyahısı", "UPDATE");
  const canDelete = hasPermission("Anamnez siyahısı", "DELETE");
  const canStatus = hasPermission("Anamnez siyahısı", "STATUS");
  const {
    anamnesisList,
    fetchAnamnesisList,
    removeAnamnesis,
    loading,
    updateAnamnesisStatus,
  } = useAnamnesisListStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (categoryId) {
      fetchAnamnesisList(categoryId);
    }
  }, [categoryId, fetchAnamnesisList]);

  const handleEdit = (id) => {
    navigate(`/anamnesis/anamnesis-details/${categoryId}/edit/${id}`);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `"${name}" anamnezini silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await removeAnamnesis(id);
      await fetchAnamnesisList(categoryId);
      toast.success(`${name} uğurla silindi.`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Silinmə zamanı xəta baş verdi.");
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateAnamnesisStatus(row.id, { status: newStatus });
      setTimeout(() => {
        fetchAnamnesisList(categoryId);
      }, 500);
      toast.success("Status uğurla dəyişdirildi!");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Status dəyişdirilə bilmədi!");
    }
  };

  const filteredAnamnesis = (anamnesisList || []).filter((item) => {
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const dataToExport = filteredAnamnesis.map((item, idx) => ({
      "№": idx + 1,
      "Anamnezin adı": item.name || "",
      "Status": item.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "anamnezler_siyahisi");
  };

  return (
    <div className="settings-page-shell">
      <ToastContainer />
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
              <option value="INACTIVE">Passiv</option>
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
              <Link
                to={`/anamnesis/anamnesis-details/${categoryId}/add`}
                className="settings-btn-add"
              >
                <span>+</span> Yeni anamnez əlavə et
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Anamnezin adı
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
              ) : filteredAnamnesis.length === 0 ? (
                <tr>
                  <td colSpan="4" className="settings-empty-state">Heç bir anamnez tapılmadı.</td>
                </tr>
              ) : (
                filteredAnamnesis.map((row, index) => (
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
                              onClick={() => handleEdit(row.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnamnesisList;
