import React, { useEffect, useState } from "react";
import "../../assets/style/Anamnesis/anamnesiscategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAnamnesisCategoryStore from "../../../stores/anamnesisCategoryStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel as clientExportToExcel } from "../../utils/exportExcel";

const AnamnesisCategoryList = () => {
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Anamnez siyahısı", "CREATE");
  const canUpdate = hasPermission("Anamnez siyahısı", "UPDATE");
  const canDelete = hasPermission("Anamnez siyahısı", "DELETE");
  const canStatus = hasPermission("Anamnez siyahısı", "STATUS");
  const {
    categories,
    fetchCategories,
    deleteCategory,
    loading,
    updateCategoryStatus,
  } = useAnamnesisCategoryStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (id) => {
    navigate(`/anamnesis/edit-category/${id}`);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `${name} kateqoriyasını silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      toast.success(`${name} uğurla silindi.`);
    } catch (error) {
      toast.error("Silinmə zamanı xəta baş verdi.");
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateCategoryStatus(row.id, newStatus);
      toast.success("Status uğurla dəyişdirildi!");
    } catch (err) {
      toast.error("Status dəyişdirilə bilmədi!");
    }
  };

  const filteredCategories = (categories || [])
    .filter((category) => {
      const matchesSearch = (category.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || category.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .map((category) => ({
      ...category,
      anamnesisCount: category.anemnesisListReadResponse?.length || 0,
    }));

  const handleExport = () => {
    const dataToExport = filteredCategories.map((c, idx) => ({
      "№": idx + 1,
      "Kateqoriya": c.name || "",
      "Anamnez sayı": c.anamnesisCount,
      "Status": c.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    clientExportToExcel(dataToExport, "anamnez_kateqoriyalari");
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
              <Link to="./add-category" className="settings-btn-add">
                <span>+</span> Yeni kateqoriya əlavə et
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Kateqoriyanın adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Anamnezlər
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
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="settings-empty-state">Heç bir kateqoriya tapılmadı.</td>
                </tr>
              ) : (
                filteredCategories.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.name}</td>
                    <td>
                      <Link
                        to={`/anamnesis/anamnesis-details/${row.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Anamnezləri ({row.anamnesisCount})
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

export default AnamnesisCategoryList;
