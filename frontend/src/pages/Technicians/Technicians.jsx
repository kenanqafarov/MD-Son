import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useTechnicianStore from "../../../stores/technicianStore";
import { CiSearch, CiExport, CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import "../../assets/style/Technicians/technicians.css";
import "./tech.css";
import { usePermission } from "../../hooks/usePermission";

function Technicians() {
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Texniklər", "CREATE");
  const canUpdate = hasPermission("Texniklər", "UPDATE");
  const canDelete = hasPermission("Texniklər", "DELETE");
  const canStatus = hasPermission("Texniklər", "STATUS");
  const {
    technicians,
    fetchTechnicians,
    removeTechnician,
    exportToExcel,
    searchTechs,
    updateTechStatus,
    loading,
    error,
  } = useTechnicianStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigation = useNavigate();

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const getStatus = (tech) => (tech.status === "ACTIVE" ? "Aktiv" : "Passiv");

  const toggleStatus = async (tech) => {
    const newStatus = tech.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateTechStatus(tech.id, newStatus);
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
      console.error(error);
    }
  };

  const handleDelete = async (tech) => {
    const confirmDelete = window.confirm(
      `İşçini silmək istədiyinizə əminsiniz? (${tech.username})`
    );
    if (!confirmDelete) return;

    try {
      await removeTechnician(tech.id);
      alert("İşçi uğurla silindi!");
    } catch (err) {
      alert("Silinmə zamanı xəta baş verdi.");
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const icons = [
    {
      icon: CiCircleInfo,
      action: (row) => navigation(`${row.id}`),
      className: "info",
    },
  ];
  if (canUpdate) {
    icons.push({
      icon: FiEdit3,
      action: (row) => navigation(`edit/${row.id}`),
      className: "edit",
    });
  }
  if (canDelete) {
    icons.push({
      icon: GoTrash,
      action: (row) => handleDelete(row),
      className: "delete",
    });
  }

  if (loading) {
    return <div>Yüklənir...</div>;
  }

  if (error) {
    return <div>Xəta: {error}</div>;
  }
  
  // `technicians` məlumatının Array olub olmadığını yoxlayın
  const techList = Array.isArray(technicians) ? technicians : [];

  const filteredTechList = techList.filter((tech) => {
    if (!tech) return false;
    const matchesStatus = statusFilter === "" || tech.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (tech.username || "").toLowerCase().includes(searchLower) ||
      (tech.name || "").toLowerCase().includes(searchLower) ||
      (tech.surname || "").toLowerCase().includes(searchLower) ||
      (tech.patronymic || "").toLowerCase().includes(searchLower) ||
      (tech.phone || "").toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

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
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="settings-right-controls">
            {canCreate && (
              <Link className="settings-btn-add" to={"add"}>
                <span>+</span> Yenisini əlavə et
              </Link>
            )}
            <button
              type="button"
              className="settings-btn-export"
              onClick={exportToExcel}
              title="Excel-ə ixrac et"
            >
              <CiExport size={20} />
            </button>
          </div>
        </div>

        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th>İstifadəçi adı</th>
                <th>Adı</th>
                <th>Soyadı</th>
                <th>Ata adı</th>
                <th>İcazələr</th>
                <th>Mobil nömrə</th>
                <th>Qiymətlər</th>
                <th>Status</th>
                <th className="settings-col-actions">Düzəliş</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechList.length > 0 ? (
                filteredTechList.map((tech) =>
                  tech && tech.username ? (
                    <tr
                      key={tech.id}
                      onClick={() => navigation(`${tech.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(
                              tech.username
                            )}`}
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid #E2E8F0" }}
                            alt={tech.username}
                          />
                          <span style={{ fontWeight: 600, color: "#1E293B" }}>{tech.username}</span>
                        </div>
                      </td>
                      <td>{tech.name || "—"}</td>
                      <td>{tech.surname || "—"}</td>
                      <td>{tech.patronymic || "—"}</td>
                      <td>
                        <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                          Texnik
                        </span>
                      </td>
                      <td>{tech.phone || "—"}</td>
                      <td>
                        <Link
                          to={`prices/${tech.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: "#155EEF", fontWeight: 500, fontSize: "13px", textDecoration: "none" }}
                          onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                          onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                        >
                          Qiymətlər
                        </Link>
                      </td>
                      <td>
                        <span
                          className={`settings-status-badge ${
                            tech.status === "ACTIVE" ? "active" : "passive"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            canStatus && toggleStatus(tech);
                          }}
                          style={{ cursor: canStatus ? "pointer" : "default" }}
                          title="Statusu dəyişmək üçün klikləyin"
                        >
                          <span className="settings-status-dot" />
                          {getStatus(tech)}
                        </span>
                      </td>
                      <td className="settings-col-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-actions-group">
                          {icons.map(
                            ({ icon: IconComp, className, action }, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`settings-action-btn ${className}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action(tech);
                                }}
                              >
                                <IconComp />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null
                )
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className="settings-empty-state">Heç bir texnik tapılmadı.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Technicians;