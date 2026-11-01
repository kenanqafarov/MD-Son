import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../../assets/style/Operations/operationcategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { IoArrowBack } from "react-icons/io5";
import useOperationItemsTypeStore from "../../../../stores/operationItemTypeStore";
import useOperationTypesStore from "../../../../stores/operationsTypeStore";
import useInsuranceCompanyStore from "../../../../stores/insuranceStore";
import { usePermission } from "../../../hooks/usePermission";
import { exportToExcel } from "../../../utils/exportExcel";

const InsuranceOperationList = () => {
  const { insuranceId, id } = useParams();
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Əməliyyat növləri", "CREATE");
  const canUpdate = hasPermission("Əməliyyat növləri", "UPDATE");
  const canDelete = hasPermission("Əməliyyat növləri", "DELETE");
  const canStatus = hasPermission("Əməliyyat növləri", "STATUS");

  const {
    operationItemsType,
    fetchAllOp,
    remove,
    updateStatus,
  } = useOperationItemsTypeStore();

  const {
    operationTypes,
    selectedOperationType,
    fetchAll: fetchAllCategories,
    fetchById: fetchCategoryById,
  } = useOperationTypesStore();

  const { selectedCompany, fetchById: fetchCompanyById } = useInsuranceCompanyStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (insuranceId) {
      fetchCompanyById(insuranceId);
      fetchAllCategories(Number(insuranceId));
    }
  }, [insuranceId, fetchCompanyById, fetchAllCategories]);

  useEffect(() => {
    if (id) {
      fetchAllOp(id);
      fetchCategoryById(id);
    }
  }, [id, fetchAllOp, fetchCategoryById]);

  useEffect(() => {
    if (selectedOperationType && insuranceId && operationTypes?.length > 0) {
      const targetInsuranceId = Number(insuranceId);
      if (selectedOperationType.insuranceCompanyId !== targetInsuranceId) {
        const match = operationTypes.find(
          (c) =>
            c.categoryName?.trim().toLowerCase() === selectedOperationType.categoryName?.trim().toLowerCase() ||
            c.categoryCode?.trim().toLowerCase() === selectedOperationType.categoryCode?.trim().toLowerCase()
        );
        if (match && match.id !== Number(id)) {
          navigate(`/insurance/${insuranceId}/operations/${match.id}`, { replace: true });
        }
      }
    }
  }, [selectedOperationType, insuranceId, operationTypes, id, navigate]);

  const filteredOperations = (operationItemsType || []).filter((item) => {
    const matchesSearch =
      (item.operationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.operationCode || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (opId) => {
    navigate(`/insurance/${insuranceId}/operations/${id}/edit/${opId}`);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Əməliyyatı silmək istədiyinizə əminsiniz?")) {
      await remove(itemId);
      await fetchAllOp(id);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredOperations.map((item, idx) => ({
      "№": idx + 1,
      "Əməliyyatın adı": item.operationName || "",
      "Kod": item.operationCode || "",
      "Qiymət": item.price != null ? `${item.price} ₼` : "",
      "Texniklərdə görünsün": item.showTechnic ? "Bəli" : "Xeyr",
      "Status": item.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "sigorta_emeliyyatlari");
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(item.id, { status: newStatus });
      await fetchAllOp(id);
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        {/* Navigation header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(`/insurance/${insuranceId}/operations`)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IoArrowBack /> Kateqoriyalara qayıt
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedCompany?.companyName ? `${selectedCompany.companyName} — ` : ""}
            {selectedOperationType?.categoryName ? `${selectedOperationType.categoryName} — Əməliyyatlar` : "Əməliyyatlar"}
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
                to={`/insurance/${insuranceId}/operations/${id}/add`}
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
                <th>Əməliyyatın adı</th>
                <th>Kod</th>
                <th>Qiymət</th>
                <th>Texniklərdə görünsün</th>
                <th>Status</th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOperations.length > 0 ? (
                filteredOperations.map((item, index) => (
                  <tr key={item.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{item.operationName}</td>
                    <td className="text-gray-600 font-mono text-xs">{item.operationCode}</td>
                    <td className="font-semibold text-emerald-600">
                      {item.price != null ? `${item.price} ₼` : "-"}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          item.showTechnic
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.showTechnic ? "Bəli" : "Xeyr"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          item.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() => canStatus && handleStatusToggle(item)}
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
              ) : (
                <tr>
                  <td colSpan={7} className="settings-empty-state">
                    Məlumat tapılmadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsuranceOperationList;
