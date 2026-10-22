import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWorkersScheduleStore from "../../../stores/workersScheduleStore";
import useCabinetStore from "../../../stores/cabinetStore";

import "../../assets/style/EmployeesPage/employeeworkscheduleadd.css";

import acceptProcess from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelProcess from "../../assets/images/EmployeesPage/cancelProcess.png";

import { toast } from "react-toastify";

function EmployeeWorkScheduleEdit() {
  const { id } = useParams(); // schedule id
  const navigate = useNavigate();

  const { schedules, updateSchedule, fetchSchedules, removeSchedule } =
    useWorkersScheduleStore();
  const { cabinets, fetchCabinets } = useCabinetStore();

  // Form üçün state-lər
  const [weekDay, setWeekDay] = useState("");
  const [cabinetName, setCabinetName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [userId, setUserId] = useState("");

  const daysOfWeek = [
    { value: "MONDAY", label: "Bazar ertəsi" },
    { value: "TUESDAY", label: "Çərşənbə axşamı" },
    { value: "WEDNESDAY", label: "Çərşənbə" },
    { value: "THURSDAY", label: "Cümə axşamı" },
    { value: "FRIDAY", label: "Cümə" },
    { value: "SATURDAY", label: "Şənbə" },
    { value: "SUNDAY", label: "Bazar" },
  ];

  const formatT = (t) => {
    if (!t) return "";
    if (typeof t === "string") return t.slice(0, 5);
    if (typeof t === "object" && t.hour !== undefined) {
      return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
    }
    return "";
  };

  useEffect(() => {
    fetchCabinets(); // kabinetləri gətir
    if (schedules.length === 0) {
      fetchSchedules();
    } else {
      const sched = schedules.find((s) => s.id.toString() === id);
      if (sched) {
        setWeekDay(sched.weekDay || "");
        setCabinetName(sched.cabinetName || "");
        setStartTime(formatT(sched.startTime));
        setFinishTime(formatT(sched.finishTime));
        setUserId(sched.userId || "");
      }
    }
  }, [id, schedules, fetchSchedules, fetchCabinets]);

  // Form göndərmə funksiyası
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!weekDay || !cabinetName) {
      toast.error("Zəhmət olmasa, bütün * işarəli xanaları doldurun.");
      return;
    }

    const updatedData = {
      id: Number(id),
      weekDay,
      cabinetName,
      startTime: startTime ? startTime + ":00" : "00:00:00",
      finishTime: finishTime ? finishTime + ":00" : "00:00:00",
    };

    try {
      await updateSchedule(updatedData);
      toast.success("İş qrafiki uğurla yeniləndi!");
      navigate(userId ? `/employees/work-schedule/${userId}` : -1);
    } catch (err) {
      toast.error("Qrafiki yeniləmək mümkün olmadı");
    }
  };

  // Silmə funksiyası
  const handleDelete = async () => {
    if (window.confirm("Qrafiki silmək istədiyinizə əminsiniz?")) {
      try {
        await removeSchedule(Number(id));
        toast.success("Qrafik uğurla silindi!");
        navigate(userId ? `/employees/work-schedule/${userId}` : -1);
      } catch (err) {
        toast.error("Qrafiki silmək mümkün olmadı");
      }
    }
  };

  return (
    <div className="employeeWorkScheduleAddContainer">
      <form className="employeeWorkScheduleAdd" onSubmit={handleSubmit}>
        <div className="employeeWorkScheduleAddWrapper">
          {/* Həftənin günü */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">
              Həftənin günü <span className="requiredStarForEmployeeAdd">*</span>
            </p>
            <select
              value={weekDay}
              onChange={(e) => setWeekDay(e.target.value)}
              required
            >
              <option value="">Seçin</option>
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kabinet */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">
              Kabinet <span className="requiredStarForEmployeeAdd">*</span>
            </p>
            <select
              value={cabinetName}
              onChange={(e) => setCabinetName(e.target.value)}
              required
            >
              <option value="">Seçin</option>
              {cabinets.map((c) => (
                <option
                  key={c.id || c.value}
                  value={c.name || c.cabinetName || c.value}
                >
                  {c.name || c.cabinetName || c.value}
                </option>
              ))}
            </select>
          </div>

          {/* Başlama və bitmə saatı */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">Başlama saatı</p>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">Bitmə saatı</p>
            <input
              type="time"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="employeeWorkScheduleAddActionsButtons"
          style={{ display: "flex", gap: "1rem" }}
        >
          <button
            type="button"
            className="employeeAddCancelProcess"
            onClick={() => navigate(userId ? `/employees/work-schedule/${userId}` : -1)}
          >
            <img src={cancelProcess} alt="İmtina et" />
            İmtina et
          </button>

          <button type="submit" className="employeeAddAcceptProcess">
            <img src={acceptProcess} alt="Yadda saxla" />
            Yadda saxla
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Qrafiki Sil
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeWorkScheduleEdit;
