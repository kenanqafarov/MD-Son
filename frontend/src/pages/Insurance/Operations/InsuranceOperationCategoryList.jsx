import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../../assets/style/Operations/operationcategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";
import useOperationTypesStore from "../../../../stores/operationsTypeStore";
import useInsuranceCompanyStore from "../../../../stores/insuranceStore";
import { usePermission } from "../../../hooks/usePermission";
import { exportToExcel } from "../../../utils/exportExcel";

const InsuranceOperationCategoryList = () => {
  const { insuranceId } = useParams();
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Əməliyyat növləri", "CREATE");
  const canUpdate = hasPermission("Əməliyyat növləri", "UPDATE");
  const canDelete = hasPermission("Əməliyyat növləri", "DELETE");
  const canStatus = hasPermission("Əməliyyat növləri", "STATUS");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const {
    operationTypes,
    loading,
    error,
    fetchAll,
    remove,
    updateStatus,
  } = useOperationTypesStore();

  const { selectedCompany, fetchById } = useInsuranceCompanyStore();

  useEffect(() => {
    if (insuranceId) {
      fetchAll(Number(insuranceId));
      fetchById(insuranceId);
    }
  }, [insuranceId, fetchAll, fetchById]);

  const filteredOperationTypes = (operationTypes || []).filter((operation) => {
    const matchesSearch = (operation.categoryName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "" || operation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id) => {
    navigate(`/insurance/${insuranceId}/operations/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Əməliyyat kateqoriyasını silmək istədiyinizə əminsiniz?")) {
      try {
        await remove(id, Number(insuranceId));
      } catch (err) {
        alert("Silərkən xəta baş verdi!");
      }
    }
  };

  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(row.id, { status: newStatus }, Number(insuranceId));
    } catch (err) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredOperationTypes.map((row, idx) => ({
      "№": idx + 1,
      "Kateqoriya adı": row.categoryName || "",
      "Əməliyyat sayı": row.opTypeItemCount || 0,
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "sigorta_emeliyyat_kateqoriyalari");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        {/* Navigation header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/insurance")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IoArrowBack /> Sığortalar siyahısına qayıt
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedCompany?.companyName ? `${selectedCompany.companyName} — Əməliyyat növləri` : "Sığorta əməliyyat növləri"}
          </h2>
        </div>

        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              <Link
                to={`/insurance/${insuranceId}/operations/add`}
                className="settings-btn-add"
              >
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Kateqoriya adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Əməliyyatların sayı
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
              ) : filteredOperationTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="settings-empty-state">
                    Bu sığorta şirkəti üçün hələ əməliyyat növü əlavə edilməyib.
                  </td>
                </tr>
              ) : (
                filteredOperationTypes.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.categoryName}</td>
                    <td>
                      <Link
                        to={`/insurance/${insuranceId}/operations/${row.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Əməliyyatların sayı ({row.opTypeItemCount || 0})
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
                        onClick={() => canStatus && handleStatusToggle(row)}
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
              )}
            </tbody>
          </table>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mt-2">
              Xəta baş verdi: {error.message || error.toString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceOperationCategoryList;
