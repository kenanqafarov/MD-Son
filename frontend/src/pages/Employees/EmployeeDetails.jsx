import React from "react";
import {
  useWorker,
  useUpdateWorker,
  useDeleteWorker,
} from "../../hooks/useWorkers";
import TitleUpdater from "../../components/TitleUpdater";
import UserForm from "../../components/UserForm";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { FiDownload } from "react-icons/fi";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useWorker(id);
  const { mutate: updateWorker, isPending: isUpdating } = useUpdateWorker();
  const { mutate: deleteWorker, isPending: isDeleting } = useDeleteWorker();

  const handleUpdate = (formData) => {
    const updateData = {
      ...formData,
      id: id,
    };

    updateWorker(updateData, {
      onSuccess: () => {
        toast.success("İşçi məlumatları uğurla yeniləndi");
        navigate("/employees");
      },
      onError: () => {
        toast.error("İşçi məlumatlarını yeniləmək mümkün olmadı");
      },
    });
  };

  const handleDelete = () => {
    deleteWorker(id, {
      onSuccess: () => {
        toast.success("İşçi uğurla silindi");
        navigate("/employees");
      },
      onError: () => {
        navigate("/employees");
      },
    });
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Pop-up pəncərə bloklandı. Zəhmət olmasa icazə verin.");
      return;
    }

    const permissionsText = Array.isArray(data.permissions)
      ? data.permissions.join(", ")
      : data.permissions
      ? Array.from(data.permissions).join(", ")
      : "-";

    const genderText =
      data.genderStatus === "MAN"
        ? "Kişi"
        : data.genderStatus === "WOMAN"
        ? "Qadın"
        : "-";
    const statusText = data.enabled ? "Aktiv" : "Passiv";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>İşçi Məlumat Vərəqəsi - ${data.name || ""} ${data.surname || ""}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
          .profile-row { display: flex; gap: 24px; align-items: center; margin-bottom: 24px; }
          .avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #0284c7; }
          .avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #94a3b8; border: 2px dashed #cbd5e1; }
          .user-title { font-size: 20px; font-weight: bold; color: #1e293b; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table th, .table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .table th { width: 30%; font-weight: 600; color: #475569; background: #f8fafc; }
          .table td { color: #0f172a; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">MODERN DENTISTRY CLINIC</h1>
            <div class="subtitle">İşçi haqqında rəsmi məlumat vərəqəsi</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            Tarix: ${new Date().toLocaleDateString("az-AZ")}
          </div>
        </div>

        <div class="card">
          <div class="profile-row">
            ${
              data.profilePhotoPath
                ? `<img src="${data.profilePhotoPath}" class="avatar" alt="Profile" />`
                : `<div class="avatar-placeholder">👤</div>`
            }
            <div>
              <div class="user-title">${data.name || ""} ${data.surname || ""} ${data.patronymic || ""}</div>
              <div style="color: #64748b; font-size: 14px; margin-top: 4px;">İstifadəçi adı: @${data.username || "-"}</div>
              <div style="display: inline-block; margin-top: 8px; padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; background: ${data.enabled ? "#dcfce7; color: #15803d;" : "#fee2e2; color: #b91c1c;"}">
                Status: ${statusText}
              </div>
            </div>
          </div>

          <table class="table">
            <tbody>
              <tr><th>FİN kod:</th><td>${data.finCode || "-"}</td></tr>
              <tr><th>Cinsiyyət:</th><td>${genderText}</td></tr>
              <tr><th>Doğum tarixi:</th><td>${data.dateOfBirth || "-"}</td></tr>
              <tr><th>Mobil nömrə 1:</th><td>${data.phone || "-"}</td></tr>
              <tr><th>Mobil nömrə 2:</th><td>${data.phone2 || "-"}</td></tr>
              <tr><th>Mobil nömrə 3:</th><td>${data.phone3 || "-"}</td></tr>
              <tr><th>Ev telefonu:</th><td>${data.homePhone || "-"}</td></tr>
              <tr><th>E-poçt:</th><td>${data.email || "-"}</td></tr>
              <tr><th>Ünvan:</th><td>${data.address || "-"}</td></tr>
              <tr><th>Dərəcə:</th><td>${data.degree || "-"}</td></tr>
              <tr><th>Təcrübə (il):</th><td>${data.experience !== undefined && data.experience !== null ? data.experience + " il" : "-"}</td></tr>
              <tr><th>İcazələr (Rollar):</th><td>${permissionsText}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>Modern Dentistry İdarəetmə Sistemi</div>
          <div>Məsul şəxsin imzası: ___________________________</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <BeatLoader />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center p-4">Error: {error.message}</div>
    );

  return (
    <div className="relative">
      <TitleUpdater title={"İşçi məlumatları"} />

      {(isUpdating || isDeleting) && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-white/10 z-10 rounded-lg">
          <BeatLoader />
        </div>
      )}

      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition cursor-pointer text-sm">
          <FiDownload size={16} /> PDF Yüklə
        </button>
      </div>

      <div
        className={`${
          isUpdating || isDeleting ? "blur-sm pointer-events-none" : ""
        }`}>
        <UserForm
          mode="view"
          userData={data}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default EmployeeDetails;
