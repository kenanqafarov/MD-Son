import "../../assets/style/ProductCategory/product.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { useProductStore } from "../../../stores/productStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function Products() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Məhsul kateqoriyaları", "CREATE");
  const canUpdate = hasPermission("Məhsul kateqoriyaları", "UPDATE");
  const canDelete = hasPermission("Məhsul kateqoriyaları", "DELETE");
  const canStatus = hasPermission("Məhsul kateqoriyaları", "STATUS");
  
  const {
    products,
    fetchProducts,
    removeProduct,
    changeProductStatus,
    loading,
    error,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredByCategory = name
    ? (products || []).filter(
        (item) =>
          item.categoryName &&
          item.categoryName.toLowerCase() === name.toLowerCase()
      )
    : products || [];

  const filteredData = filteredByCategory.filter((row) => {
    const matchesSearchTerm = (row.productName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      (row.productNo || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || (row.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearchTerm && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`/product-categories/${name}/edit-product/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.productName} məhsulunu silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeProduct(row.id);
      alert(`${row.productName} silindi`);
    } catch (err) {
      alert("Silərkən xəta baş verdi: " + err.message);
    }
  };

  const toggleStatus = async (row) => {
    const currentStatus = row.status?.toUpperCase() || "";
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";

    try {
      await changeProductStatus({ productId: row.id, status: newStatus });
    } catch (err) {
      console.error("Status change error:", err);
      alert("Status dəyişdirilə bilmədi");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Kateqoriya": name || "",
      "Məhsulun adı": row.productName || "",
      "Məhsulun kodu": row.productNo || "",
      "Özəllikləri": row.productTitle || "",
      "Status": (row.status || "").toUpperCase() === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "mehsullar_siyahisi");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        {/* Navigation header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/product-categories")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IoArrowBack /> Kateqoriyalara qayıt
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {name ? `${name} — Məhsullar` : "Məhsullar"}
          </h2>
        </div>

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
                placeholder="Axtarış (ad və ya kod)"
                className="settings-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-right-controls">
            {canCreate && (
              <Link to={"./add-new"} className="settings-btn-add">
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Məhsulun adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Kodu
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Özəllikləri
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
                  <td colSpan="6" className="settings-empty-state">Yüklənir...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="settings-empty-state">Məhsul tapılmadı.</td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const isActive = (row.status || "").toUpperCase() === "ACTIVE";
                  return (
                    <tr key={row.id}>
                      <td className="settings-col-num">{index + 1}</td>
                      <td className="font-semibold text-gray-800">{row.productName}</td>
                      <td className="text-gray-600 font-mono text-xs">{row.productNo || "-"}</td>
                      <td className="text-gray-700">{row.productTitle || "-"}</td>
                      <td>
                        <button
                          type="button"
                          disabled={!canStatus}
                          className={`settings-status-badge ${
                            isActive
                              ? "settings-status-active"
                              : "settings-status-passive"
                          }`}
                          onClick={() => canStatus && toggleStatus(row)}
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
              )}
            </tbody>
          </table>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mt-2">
              Xəta baş verdi: {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;