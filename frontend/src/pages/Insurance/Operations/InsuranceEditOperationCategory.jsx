import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../../assets/style/Operations/editoperationcategory.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCheckmarkOutline, IoArrowBack } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import useOperationTypesStore from "../../../../stores/operationsTypeStore";

const InsuranceEditOperationCategory = () => {
  const { insuranceId, id } = useParams();
  const navigate = useNavigate();

  const { selectedOperationType, fetchById, update, clearSelected } =
    useOperationTypesStore();

  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [colorSelection, setColorSelection] = useState(false);
  const [implantSelection, setImplantSelection] = useState(false);

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
    return () => {
      clearSelected();
    };
  }, [id, fetchById, clearSelected]);

  useEffect(() => {
    if (selectedOperationType) {
      setCategoryName(selectedOperationType.categoryName || "");
      setCategoryCode(selectedOperationType.categoryCode || "");
      setColorSelection(Boolean(selectedOperationType.colorSelection));
      setImplantSelection(Boolean(selectedOperationType.implantSelection));
    }
  }, [selectedOperationType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Kateqoriya adı tələb olunur!");
      return;
    }

    const payload = {
      categoryName: categoryName.trim(),
      categoryCode: categoryCode.trim(),
      colorSelection,
      implantSelection,
      insuranceCompanyId: Number(insuranceId),
      insurances: [],
    };

    try {
      await update(id, payload, Number(insuranceId));
      toast.success("Kateqoriya uğurla yeniləndi!");
      setTimeout(() => navigate(`/insurance/${insuranceId}/operations`), 1200);
    } catch (err) {
      toast.error("Yenilənmə zamanı xəta baş verdi!");
    }
  };

  return (
    <div className="editOperationWrapper">
      <ToastContainer />
      <div style={{ maxWidth: "600px", margin: "0 auto 16px auto" }}>
        <button
          type="button"
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
            color: "#374151"
          }}
        >
          <IoArrowBack /> Geri qayıt
        </button>
      </div>

      <form className="editOperationContainer" onSubmit={handleSubmit}>
        <div className="editOperationInputGroup">
          <label>Kateqoriya adı*</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Kateqoriya adı"
            required
          />
        </div>

        <div className="editOperationInputGroup">
          <label>Kateqoriya kodu*</label>
          <input
            type="text"
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
            placeholder="Kateqoriya kodu"
          />
        </div>

        <div className="editOperationCheckboxGroup">
          <label className="editOperationCheckboxLabel">
            Rəng seçimi
            <input
              type="checkbox"
              checked={colorSelection}
              onChange={(e) => setColorSelection(e.target.checked)}
            />
          </label>
          <label className="editOperationCheckboxLabel">
            İmplant seçimi
            <input
              type="checkbox"
              checked={implantSelection}
              onChange={(e) => setImplantSelection(e.target.checked)}
            />
          </label>
        </div>

        <div className="editOperationButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate(`/insurance/${insuranceId}/operations`)}
          >
            <RxCross2 /> İmtina et
          </button>
          <button type="submit" className="acceptFormCondition">
            <IoCheckmarkOutline /> Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsuranceEditOperationCategory;
