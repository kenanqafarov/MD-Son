import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/style/Operations/addopertaion.css";
import { MdClose } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FaManatSign } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import useOperationItemsTypeStore from "../../../../stores/operationItemTypeStore";
import useInsuranceCompanyStore from "../../../../stores/insuranceStore";

const InsuranceAddOperation = () => {
  const { insuranceId, id } = useParams();
  const navigate = useNavigate();

  const { create } = useOperationItemsTypeStore();
  const { selectedCompany, fetchById: fetchCompanyById } = useInsuranceCompanyStore();

  const [operationName, setOperationName] = useState("");
  const [operationCode, setOperationCode] = useState("");
  const [price, setPrice] = useState("");
  const [visibleInTechnicians, setVisibleInTechnicians] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (insuranceId) {
      fetchCompanyById(insuranceId);
    }
  }, [insuranceId, fetchCompanyById]);

  useEffect(() => {
    if (!price) {
      const insIdNum = Number(insuranceId);
      const compName = (selectedCompany?.companyName || "").toLowerCase();
      if (insIdNum === 5 || compName.includes("paşa") || compName.includes("pasha")) {
        setPrice("5");
      } else if (insIdNum === 2 || compName.includes("atəşgah") || compName.includes("atesgah")) {
        setPrice("2");
      }
    }
  }, [insuranceId, selectedCompany, price]);

  const handleCancel = () => {
    navigate(`/insurance/${insuranceId}/operations/${id}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!operationName.trim()) newErrors.operationName = "Əməliyyatın adı tələb olunur";
    if (!operationCode.trim()) newErrors.operationCode = "Əməliyyatın kodu tələb olunur";
    if (!price.toString().trim()) newErrors.price = "Qiymət tələb olunur";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        opTypeId: Number(id),
        operationName: operationName.trim(),
        operationCode: operationCode.trim(),
        amount: parseFloat(price) || 0,
        showTechnic: visibleInTechnicians,
        status: "ACTIVE",
        prices: [],
        insurances: [],
      };

      await create(payload);
      navigate(`/insurance/${insuranceId}/operations/${id}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("Əməliyyat əlavə edilərkən xəta baş verdi!");
    }
  };

  return (
    <div className="addOperation-container">
      <div style={{ marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleCancel}
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
          <IoArrowBack /> Əməliyyatlar siyahısına qayıt
        </button>
      </div>

      <form className="addOperation-form-section" onSubmit={handleSave}>
        <div className="addOperation-form-group">
          <label htmlFor="operationName">
            Əməliyyatın adı<span>*</span>
          </label>
          <div style={{ maxWidth: "800px", width: "100%" }}>
            <input
              type="text"
              id="operationName"
              className="addOperation-input"
              style={{ width: "100%", borderColor: errors.operationName ? "red" : "" }}
              placeholder="Əməliyyatın adı"
              value={operationName}
              onChange={(e) => {
                setOperationName(e.target.value);
                if (errors.operationName) setErrors((prev) => ({ ...prev, operationName: "" }));
              }}
            />
            {errors.operationName && <span style={{ color: "red", fontSize: "12px" }}>{errors.operationName}</span>}
          </div>
        </div>

        <div className="addOperation-form-group">
          <label htmlFor="operationCode">
            Əməliyyatın kodu<span>*</span>
          </label>
          <div style={{ maxWidth: "800px", width: "100%" }}>
            <input
              type="text"
              id="operationCode"
              className="addOperation-input"
              style={{ width: "100%", borderColor: errors.operationCode ? "red" : "" }}
              placeholder="Əməliyyatın kodu"
              value={operationCode}
              onChange={(e) => {
                setOperationCode(e.target.value);
                if (errors.operationCode) setErrors((prev) => ({ ...prev, operationCode: "" }));
              }}
            />
            {errors.operationCode && <span style={{ color: "red", fontSize: "12px" }}>{errors.operationCode}</span>}
          </div>
        </div>

        <div className="addOperation-form-group">
          <label htmlFor="price">
            Qiyməti<span>*</span>
          </label>
          <div style={{ maxWidth: "800px", width: "100%", position: "relative" }}>
            <input
              type="number"
              step="0.01"
              id="price"
              className="addOperation-input"
              style={{ width: "100%", paddingRight: "35px", borderColor: errors.price ? "red" : "" }}
              placeholder="Qiymət"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280"
              }}
            >
              <FaManatSign />
            </span>
            {errors.price && <span style={{ color: "red", fontSize: "12px" }}>{errors.price}</span>}
          </div>
        </div>

        <div className="addOperation-form-group-tech">
          <label htmlFor="visibleInTechnicians" style={{ cursor: "pointer" }}>
            Texniklarda görünsün<span>*</span>
          </label>
          <input
            type="checkbox"
            id="visibleInTechnicians"
            className="addOperation-checkbox"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            checked={visibleInTechnicians}
            onChange={(e) => setVisibleInTechnicians(e.target.checked)}
          />
        </div>

        <div className="addOperation-buttons">
          <button type="button" className="addOperation-cancel-button" onClick={handleCancel}>
            <MdClose /> İmtina et
          </button>
          <button type="submit" className="addOperation-save-button">
            <FaRegSave /> Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsuranceAddOperation;
