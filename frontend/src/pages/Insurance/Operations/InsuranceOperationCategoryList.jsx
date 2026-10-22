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

  const formatStatus = (status) => {
    if (!status) return "";
    if (status.toUpperCase() === "ACTIVE") return "Aktiv";
    if (status.toUpperCase() === "PASSIVE") return "Passiv";
    return status;
  };

  return (
    <div className="operationsList-container">
      {/* Header with back button and insurance company title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <button
          onClick={() => navigate("/insurance")}
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
          <IoArrowBack /> Sığortalar siyahısına qayıt
        </button>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#1F2937" }}>
          {selectedCompany?.companyName ? `${selectedCompany.companyName} — Əməliyyat növləri` : "Sığorta əməliyyat növləri"}
        </h2>
      </div>

      <div className="operationsList-controls-section">
        <div className="operationsList-filters">
          <select
            className="operationsList-status-dropdown"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
              to={`/insurance/${insuranceId}/operations/add`}
              className="operationsList-add-new-button"
            >
              <span>+</span> Yenisini əlavə et
            </Link>
          )}
        </div>
      </div>

      <div className="operationsList-table-section">
        {loading && <p>Yüklənir...</p>}
        {error && (
          <p style={{ color: "red" }}>
            Xəta baş verdi: {error.message || error.toString()}
          </p>
        )}
        {!loading && !error && filteredOperationTypes.length === 0 && (
          <p style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
            Bu sığorta şirkəti üçün hələ əməliyyat növü əlavə edilməyib.
          </p>
        )}

        {!loading && !error && filteredOperationTypes.length > 0 && (
          <table className="operationsList-table">
            <thead>
              <tr>
                <th className="!text-center">
                  <span className="firstElementOfTHS !flex !items-center gap-1">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon !-ml-2" />
                    {`1-${filteredOperationTypes.length}`}
                  </span>
                </th>
                <th>
                  <span className="!flex !items-center gap-1 justify-center">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon" /> Kateqoriya adı
                  </span>
                </th>
                <th>
                  <span className="!flex !items-center gap-1 justify-center">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon mt-1" /> Əməliyyatların sayı
                  </span>
                </th>
                <th>
                  <span className="!flex !items-center gap-1 justify-center">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon mt-1" /> Status
                  </span>
                </th>
                {(canUpdate || canDelete) && (
                  <th className="!flex !justify-center">
                    <span>Düzəliş</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredOperationTypes.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="!text-center" style={{ fontWeight: "500" }}>
                    {row.categoryName}
                  </td>
                  <td className="!text-center">
                    <Link
                      to={`/insurance/${insuranceId}/operations/${row.id}`}
                      style={{ color: "#2563EB", textDecoration: "underline", fontWeight: "500" }}
                    >
                      Əməliyyatların sayı ({row.opTypeItemCount || 0})
                    </Link>
                  </td>
                  <td
                    onClick={() => canStatus && handleStatusToggle(row)}
                    style={{ cursor: canStatus ? "pointer" : "default" }}
                    className="!text-center"
                  >
                    <span
                      className={`operationsList-status-badge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                    >
                      {formatStatus(row.status)}
                    </span>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td>
                      <div className="operationsList-action-icons !flex !justify-center">
                        {canUpdate && (
                          <FiEdit3
                            className="operationsList-edit-button"
                            onClick={() => handleEdit(row.id)}
                          />
                        )}
                        {canDelete && (
                          <GoTrash
                            className="operationsList-delete-button"
                            onClick={() => handleDelete(row.id)}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InsuranceOperationCategoryList;
