import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useProductCategoryStore } from "../../../stores/productCategories";
import "../../assets/style/ProductCategory/productcategory.css";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function ProductCategory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Məhsul kateqoriyaları", "CREATE");
  const canUpdate = hasPermission("Məhsul kateqoriyaları", "UPDATE");
  const canDelete = hasPermission("Məhsul kateqoriyaları", "DELETE");
  const canStatus = hasPermission("Məhsul kateqoriyaları", "STATUS");

  const {
    categories,
    fetchCategories,
    removeCategory,
    changeCategoryStatus,
    loading,
    error,
  } = useProductCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredData = (categories || []).filter((row) => {
    const matchesSearch = (row.categoryName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`./edit-category/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`${row.categoryName} silinsin?`)) return;

    try {
      await removeCategory(row.id);
      alert(`${row.categoryName} silindi`);
    } catch (err) {
      alert(`Silərkən xəta baş verdi: ${err.message}`);
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await changeCategoryStatus({ id: row.id, status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilə bilmədi");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Məhsul kateqoriyasının adı": row.categoryName || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "mehsul_kateqoriyalari");
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
                <th className="settings-col-num">#</th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Məhsul kateqoriyasının adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Məhsulları
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="settings-empty-state">Məlumat tapılmadı</td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.categoryName}</td>
                    <td>
                      {row.status === "PASSIVE" ? (
                        <span className="text-xs text-gray-400 italic">
                          Məhsulları (0)
                        </span>
                      ) : (
                        <Link
                          to={`./${row.categoryName}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Məhsulları ({row.products?.length || 0})
                        </Link>
                      )}
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
              Xəta: {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCategory;