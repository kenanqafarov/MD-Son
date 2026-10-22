import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/style/Operations/addoperationcategory.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCheckmarkOutline, IoArrowBack } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import useOperationTypesStore from "../../../../stores/operationsTypeStore";

function InsuranceAddOperationCategory() {
  const { insuranceId } = useParams();
  const navigate = useNavigate();
  const createOperation = useOperationTypesStore((state) => state.create);

  const [operationCategoryName, setOperationCategoryName] = useState("");
  const [operationCategoryCode, setOperationCategoryCode] = useState("");
  const [isColorSelection, setIsColorSelection] = useState(false);
  const [isImplantSelection, setIsImplantSelection] = useState(false);

  const [errors, setErrors] = useState({
    categoryName: false,
    categoryCode: false,
  });

  const handleCategoryNameChange = (value) => {
    setOperationCategoryName(value);
    if (errors.categoryName) {
      setErrors((prev) => ({ ...prev, categoryName: false }));
    }
  };

  const handleCategoryCodeChange = (value) => {
    setOperationCategoryCode(value);
    if (errors.categoryCode) {
      setErrors((prev) => ({ ...prev, categoryCode: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {
      categoryName: false,
      categoryCode: false,
    };

    if (!operationCategoryName.trim()) {
      newErrors.categoryName = true;
      hasError = true;
    }

    if (!operationCategoryCode.trim()) {
      newErrors.categoryCode = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      toast.error("Bütün tələb olunan xanaları doldurun!");
      return;
    }

    const payload = {
      categoryName: operationCategoryName.trim(),
      categoryCode: operationCategoryCode.trim(),
      status: "ACTIVE",
      colorSelection: isColorSelection,
      implantSelection: isImplantSelection,
      insuranceCompanyId: Number(insuranceId),
      insurances: [],
    };

    try {
      await createOperation(payload, Number(insuranceId));
      toast.success("Əməliyyat kateqoriyası uğurla əlavə olundu!");
      setTimeout(() => navigate(`/insurance/${insuranceId}/operations`), 1200);
    } catch (err) {
      toast.error("Əlavə olunarkən xəta baş verdi!");
    }
  };

  return (
    <div className="addOperationWrapper">
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

      <form className="addOperationContainer" onSubmit={handleSubmit}>
        <div className="addOperationInputGroup">
          <p>
            Əməliyyat kateqoriyasının adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder={errors.categoryName ? "Bu xana tələb olunur!" : "Əməliyyat kateqoriyasının adı"}
            value={operationCategoryName}
            onChange={(e) => handleCategoryNameChange(e.target.value)}
            style={{
              borderColor: errors.categoryName ? "red" : "",
              backgroundColor: errors.categoryName ? "#ffe6e6" : ""
            }}
          />
        </div>
        <div className="addOperationInputGroup">
          <p>
            Əməliyyat kateqoriyasının kodu<span>*</span>
          </p>
          <input
            type="text"
            placeholder={errors.categoryCode ? "Bu xana tələb olunur!" : "Əməliyyat kateqoriyasının kodu"}
            value={operationCategoryCode}
            onChange={(e) => handleCategoryCodeChange(e.target.value)}
            style={{
              borderColor: errors.categoryCode ? "red" : "",
              backgroundColor: errors.categoryCode ? "#ffe6e6" : ""
            }}
          />
        </div>

        <div className="addOperationCheckboxGroup">
          <label className="addOperationCheckboxLabel -ml-55">
            Rəng seçimi
            <input
              type="checkbox"
              checked={isColorSelection}
              onChange={(e) => setIsColorSelection(e.target.checked)}
              className="ml-38"
            />
          </label>
          <label className="addOperationCheckboxLabel -ml-55">
            İmplant seçimi
            <input
              type="checkbox"
              checked={isImplantSelection}
              onChange={(e) => setIsImplantSelection(e.target.checked)}
              className="ml-33"
            />
          </label>
        </div>

        <div className="addOperationButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate(`/insurance/${insuranceId}/operations`)}
          >
            <RxCross2 />
            İmtina et
          </button>
          <button type="submit" className="acceptFormCondition">
            <IoCheckmarkOutline />
            Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
}

export default InsuranceAddOperationCategory;
