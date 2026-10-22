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
    exportToExcel,
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

  // If a category from another insurance or clinic was requested (e.g. /insurance/2/operations/1 where 1 is clinic)
  useEffect(() => {
    if (selectedOperationType && insuranceId && operationTypes?.length > 0) {
      const targetInsuranceId = Number(insuranceId);
      if (selectedOperationType.insuranceCompanyId !== targetInsuranceId) {
        // Find matching category in this insurance company
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

  const handleExport = async () => {
    await exportToExcel();
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
    <div className="operationsList-container">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <button
          onClick={() => navigate(`/insurance/${insuranceId}/operations`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid #E5E7EB",
            background: "#fff",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            color: "#374151",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        >
          <IoArrowBack /> Kateqoriyalara qayıt
        </button>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#1F2937" }}>
          {selectedCompany?.companyName ? `${selectedCompany.companyName} — ` : ""}
          {selectedOperationType?.categoryName ? `${selectedOperationType.categoryName} — Əməliyyatlar` : "Əməliyyatlar"}
        </h2>
      </div>

      <div className="operationsList-controls-section">
        <div className="operationsList-filters">
          <select
            className="operationsList-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="operationsList-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="operationsList-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="operationsList-search-button">
              <CiSearch className="operationsList-search-icon" />
            </button>
          </div>
        </div>
        <div className="operationsList-actions">
          {canCreate && (
            <Link
              to={`/insurance/${insuranceId}/operations/${id}/add`}
              className="operationsList-add-new-button"
            >
              <span>+</span> Yenisini əlavə et
            </Link>
          )}
          <button
            className="operationsList-download-button"
            onClick={handleExport}
          >
            <FiDownload className="operationsList-download-icon" />
          </button>
        </div>
      </div>

      <div className="operationsList-table-section">
        <table className="operationsList-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Əməliyyatın adı</th>
              <th>Kod</th>
              <th>Qiymət</th>
              <th>Texniklarda görünsün</th>
              <th>Status</th>
              {(canUpdate || canDelete) && <th>Düzəliş</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOperations.length > 0 ? (
              filteredOperations.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: "500" }}>{item.operationName}</td>
                  <td>{item.operationCode}</td>
                  <td style={{ fontWeight: "600", color: "#059669" }}>
                    {item.price != null ? `${item.price} ₼` : "-"}
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: item.showTechnic ? "#ECFDF5" : "#F3F4F6",
                        color: item.showTechnic ? "#059669" : "#6B7280"
                      }}
                    >
                      {item.showTechnic ? "Bəli" : "Xeyr"}
                    </span>
                  </td>
                  <td
                    onClick={() => canStatus && handleStatusToggle(item)}
                    style={{ cursor: canStatus ? "pointer" : "default" }}
                  >
                    <span
                      className={`operationsList-status-badge ${
                        item.status === "ACTIVE" ? "active" : "passive"
                      }`}
                    >
                      {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td>
                      <div className="operationsList-action-icons">
                        {canUpdate && (
                          <FiEdit3
                            className="operationsList-edit-button"
                            onClick={() => handleEdit(item.id)}
                          />
                        )}
                        {canDelete && (
                          <GoTrash
                            className="operationsList-delete-button"
                            onClick={() => handleDelete(item.id)}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  Məlumat tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsuranceOperationList;
