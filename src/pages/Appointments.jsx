import React, { useState, useEffect, useRef } from "react";
import {
  format,
  addDays,
  subWeeks,
  addWeeks,
  startOfWeek,
  isSameDay,
  parse,
  addMinutes,
  differenceInMinutes,
} from "date-fns";
import { az } from "date-fns/locale";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { TbCalendarPlus } from "react-icons/tb";
import CustomSelect from "../components/CustomSelect.jsx";
import { useNavigate } from "react-router-dom";
import useGeneralCalendarStore from "../../stores/appointments";
import usePatientStore from "../../stores/patiendStore";
import useWorkerStore from "../../stores/workerStore";
import usePermissionStore from "../../stores/permissionStore";
import { fetchWorkersByPermission } from "../api/add-worker";
import { getDoctorColor } from "../utils/doctorColorUtils";
import { toast } from "react-toastify";
import "../assets/style/appointments.css";
import { usePermission } from "../hooks/usePermission";

const WEEKDAYS_SHORT = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];
const startTime = "06:30";
const endTime = "23:00";
const intervalMinutes = 30;

// İş saatları siyahısı
const WORK_HOURS = [];
const [startHour, startMinute] = startTime.split(":").map(Number);
const [endHour, endMinute] = endTime.split(":").map(Number);

let currentMinutes = startHour * 60 + startMinute;
const endTotalMinutes = endHour * 60 + endMinute;

while (currentMinutes <= endTotalMinutes) {
  const hour = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
  const minute = String(currentMinutes % 60).padStart(2, "0");
  WORK_HOURS.push(`${hour}:${minute}`);
  currentMinutes += intervalMinutes;
}

const getTimeSlotLabel = (time, index) => {
  if (index < WORK_HOURS.length - 1) {
    return `${time} - ${WORK_HOURS[index + 1]}`;
  }
  const [h, m] = time.split(":").map(Number);
  const totalM = h * 60 + m + intervalMinutes;
  const nextH = String(Math.floor(totalM / 60) % 24).padStart(2, "0");
  const nextM = String(totalM % 60).padStart(2, "0");
  return `${time} - ${nextH}:${nextM}`;
};

// Rəng yaratmaq
const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 150) + 50;
  const g = Math.floor(Math.random() * 150) + 50;
  const b = Math.floor(Math.random() * 150) + 50;
  return `rgb(${r}, ${g}, ${b}, 0.7)`;
};

const Appointments = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Ümumi təqvim", "CREATE");
  const calendarRef = useRef(null);

  const [selectedProfession, setSelectedProfession] = useState(null);
  const [professionWorkers, setProfessionWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointmentColors, setAppointmentColors] = useState({});
  const [debugInfo, setDebugInfo] = useState("");

  const {
    doctors,
    rooms,
    appointments,
    loading,
    fetchDoctors,
    fetchRooms,
    fetchDoctorPatients,
    fetchRoomPatients,
    fetchAllAppointments,
  } = useGeneralCalendarStore();

  const { patients, fetchPatients } = usePatientStore();
  const { workers, fetchWorkers } = useWorkerStore();
  const { permissions, fetchPermissions } = usePermissionStore();

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  useEffect(() => {
    let isCurrent = true;
    if (selectedProfession?.value) {
      setWorkersLoading(true);
      fetchWorkersByPermission(selectedProfession.value)
        .then((data) => {
          if (!isCurrent) return;
          const list = Array.isArray(data) ? data : [];
          if (list.length === 0 && Array.isArray(workers)) {
            const permNameLower = selectedProfession.value.toLowerCase();
            const fallbackList = workers.filter((w) => {
              if (Array.isArray(w.permissions)) {
                return w.permissions.some(
                  (p) =>
                    (typeof p === "string" ? p : p.permissionName || "")
                      .toLowerCase() === permNameLower
                );
              }
              return false;
            });
            setProfessionWorkers(fallbackList);
          } else {
            setProfessionWorkers(list);
          }
          setWorkersLoading(false);
        })
        .catch((err) => {
          console.error("fetchWorkersByPermission xətası:", err);
          if (!isCurrent) return;
          if (Array.isArray(workers)) {
            const permNameLower = selectedProfession.value.toLowerCase();
            const fallbackList = workers.filter((w) => {
              if (Array.isArray(w.permissions)) {
                return w.permissions.some(
                  (p) =>
                    (typeof p === "string" ? p : p.permissionName || "")
                      .toLowerCase() === permNameLower
                );
              }
              return false;
            });
            setProfessionWorkers(fallbackList);
          } else {
            setProfessionWorkers([]);
          }
          setWorkersLoading(false);
        });
    } else {
      setProfessionWorkers([]);
      setWorkersLoading(false);
    }
    return () => {
      isCurrent = false;
    };
  }, [selectedProfession, workers]);

  const findDoctorForAppointment = (appointment) => {
    if (!appointment) return null;

    if (selectedDoctorId) {
      const doc =
        (workers || []).find(
          (w) =>
            String(w.id) === String(selectedDoctorId) ||
            String(w.doctorId) === String(selectedDoctorId)
        ) ||
        (doctors || []).find(
          (d) =>
            String(d.id) === String(selectedDoctorId) ||
            String(d.doctorId) === String(selectedDoctorId)
        ) ||
        (professionWorkers || []).find(
          (w) =>
            String(w.id) === String(selectedDoctorId) ||
            String(w.doctorId) === String(selectedDoctorId)
        );
      if (doc) return doc;
      return { id: selectedDoctorId };
    }

    const directDocId =
      appointment.doctorId ||
      appointment.baseUserId ||
      appointment.baseUser;
    if (directDocId) {
      const docIdStr =
        typeof directDocId === "object"
          ? String(directDocId.id || directDocId.doctorId || "")
          : String(directDocId).trim();
      const found =
        (workers || []).find(
          (w) => String(w.id) === docIdStr || String(w.doctorId) === docIdStr
        ) ||
        (doctors || []).find(
          (d) => String(d.id) === docIdStr || String(d.doctorId) === docIdStr
        );
      if (found) return found;
      return { id: docIdStr };
    }

    const matchedPatient = findPatientForAppointment(appointment);
    if (matchedPatient) {
      const pDocId =
        matchedPatient.baseUser ||
        matchedPatient.doctorId ||
        matchedPatient.doctor_id;
      if (pDocId) {
        const pDocIdStr =
          typeof pDocId === "object"
            ? String(pDocId.id || pDocId.doctorId || "")
            : String(pDocId).trim();
        const found =
          (workers || []).find(
            (w) =>
              String(w.id) === pDocIdStr || String(w.doctorId) === pDocIdStr
          ) ||
          (doctors || []).find(
            (d) =>
              String(d.id) === pDocIdStr || String(d.doctorId) === pDocIdStr
          );
        if (found) return found;
        return { id: pDocIdStr };
      }
    }

    return null;
  };

  const findPatientForAppointment = (appointment) => {
    if (!appointment) return null;
    if (appointment.patientId) {
      const byId = (patients || []).find((p) => String(p.id) === String(appointment.patientId));
      if (byId) return byId;
    }
    const cleanApptName = (appointment.patientName || "").trim().toLowerCase();
    if (!cleanApptName) return null;

    return (patients || []).find((p) => {
      const fullName1 = `${p.name || ""} ${p.surname || ""}`.trim().toLowerCase();
      const fullName2 = `${p.surname || ""} ${p.name || ""}`.trim().toLowerCase();
      const firstName = (p.name || "").trim().toLowerCase();

      return (
        fullName1 === cleanApptName ||
        fullName2 === cleanApptName ||
        (firstName && firstName === cleanApptName) ||
        (fullName1 && cleanApptName.includes(fullName1)) ||
        (cleanApptName && fullName1.includes(cleanApptName))
      );
    });
  };

  const handleAppointmentClick = (e, appointment) => {
    e.stopPropagation();
    const matched = findPatientForAppointment(appointment);
    if (matched?.id) {
      navigate(`/patients/patient/${matched.id}/general`);
    } else {
      toast.info(`Pasiyent axtarılır: ${appointment.patientName}`);
      navigate(`/patients?search=${encodeURIComponent(appointment.patientName || "")}`);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchRooms();
  }, [fetchDoctors, fetchRooms]);

  // Həkim, otaq və ya default olaraq bütün randevuları yüklə
  useEffect(() => {
    if (selectedDoctorId) {
      setDebugInfo(`Həkim üzrə randevular yüklənir...`);
      fetchDoctorPatients(selectedDoctorId);
    } else if (selectedRoom) {
      setDebugInfo(`Otaq: ${selectedRoom.value} üzrə randevular yüklənir...`);
      fetchRoomPatients(selectedRoom.value);
    } else {
      setDebugInfo("Bütün randevular yüklənir...");
      fetchAllAppointments();
    }
  }, [selectedDoctorId, selectedRoom, fetchDoctorPatients, fetchRoomPatients, fetchAllAppointments]);

  // Rəngləri saxlamaq
  useEffect(() => {
    setDebugInfo(`${appointments.length} randevu yükləndi`);
    const newAppointmentColors = {};
    appointments.forEach((appointment) => {
      const uniqueKey = `${appointment.patientName}-${appointment.date}-${appointment.time}`;
      if (!appointmentColors[uniqueKey]) {
        newAppointmentColors[uniqueKey] = generateRandomColor();
      }
    });
    setAppointmentColors((prevColors) => ({
      ...prevColors,
      ...newAppointmentColors,
    }));
  }, [appointments]);

  const handleProfessionChange = (option) => {
    setSelectedProfession(option);
    setSelectedDoctorId(null);
    if (option) {
      setSelectedRoom(null);
    }
  };

  const handleRoomChange = (option) => {
    setSelectedRoom(option);
    if (option) {
      setSelectedDoctorId(null);
    }
  };

  const handleDoctorChange = (option) => {
    setSelectedDoctorId(option ? option.value : null);
    if (option) {
      setSelectedRoom(null);
    }
  };

  const professionOptions = (permissions || [])
    .filter((p) => !p.status || p.status === "ACTIVE" || p.status === "Aktiv")
    .reduce((acc, p) => {
      const name = (p.permissionName || "").trim();
      if (name && !acc.some((opt) => opt.value.toLowerCase() === name.toLowerCase())) {
        acc.push({
          value: name,
          label: name,
        });
      }
      return acc;
    }, []);

  const doctorOptions = doctors.map((doctor) => {
    const fullName = [doctor.name, doctor.surname].filter(Boolean).join(" ").trim();
    return {
      value: doctor.doctorId,
      label: fullName || doctor.username || "Həkim",
    };
  });

  const workerOptions = selectedProfession
    ? professionWorkers.map((worker) => {
        const fullName = [worker.name, worker.surname].filter(Boolean).join(" ").trim();
        return {
          value: worker.id || worker.doctorId,
          label: fullName || worker.username || "Əməkdaş",
        };
      })
    : doctorOptions;

  const roomOptions = rooms.map((room) => ({
    value: room.cabinetName,
    label: room.cabinetName,
  }));

  const weekDates = [...Array(7)].map((_, i) => addDays(selectedWeekStart, i));
  const dateRangeText = `${format(weekDates[0], "d MMMM", {
    locale: az,
  })} - ${format(weekDates[6], "d MMMM", { locale: az })}`;

  const goToPreviousWeek = () =>
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  const goToNextWeek = () =>
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const getAppointmentStyle = (appointment) => {
    try {
      const cellHeightPx = 60;
      const timeStr = appointment.time || "09:00:00";
      const periodStr = appointment.period || "01:00:00";

      const appointmentStartTime = parse(
        timeStr,
        "HH:mm:ss",
        new Date()
      );

      const [periodHours, periodMinutes, periodSeconds] = periodStr
        .split(":")
        .map(Number);
      const periodInMinutes =
        (periodHours || 0) * 60 + (periodMinutes || 0) + Math.round((periodSeconds || 0) / 60);

      const appointmentEndTime = addMinutes(
        appointmentStartTime,
        periodInMinutes
      );

      const scheduleStartTimeAsDate = parse(startTime, "HH:mm", new Date());

      const offsetMinutes = differenceInMinutes(
        appointmentStartTime,
        scheduleStartTimeAsDate
      );

      const totalDurationMinutes = differenceInMinutes(
        appointmentEndTime,
        appointmentStartTime
      );

      const pixelsPerMinute = cellHeightPx / intervalMinutes;

      const top = offsetMinutes * pixelsPerMinute;
      let height = totalDurationMinutes * pixelsPerMinute;

      const containerHeight = WORK_HOURS.length * cellHeightPx;
      if (top + height > containerHeight) {
        height = containerHeight - top - 2;
      }

      // Doctor's assigned color for appointment card
      const matchedDoctor = findDoctorForAppointment(appointment);
      const fallbackKey =
        appointment.patientName || appointment.cabinetName || "";
      const backgroundColor = getDoctorColor(
        matchedDoctor,
        [...(workers || []), ...(professionWorkers || [])],
        doctors,
        fallbackKey
      );

      return {
        top: `${top}px`,
        height: `${Math.max(height, 20)}px`,
        backgroundColor: backgroundColor,
        borderRadius: "4px",
        padding: "5px",
        overflow: "hidden",
        fontSize: "0.85em",
        color: "white",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        left: "1px",
        width: "calc(100% - 2px)",
        position: "absolute",
        cursor: "pointer",
      };
    } catch (error) {
      console.error("Error calculating appointment style:", error, appointment);
      return { display: "none" };
    }
  };

  return (
    <div className="appointments-container">
      <div className="full-width-container">
        <div className="select-options-row">
          <CustomSelect
            options={professionOptions}
            onChange={handleProfessionChange}
            placeholder="Peşə seç"
            value={selectedProfession}
            isClearable
            isSearchable
            className="select-item"
          />
          <CustomSelect
            options={workerOptions}
            onChange={handleDoctorChange}
            placeholder={
              selectedProfession
                ? `${selectedProfession.label} seç`
                : "Həkim / Əməkdaş seç"
            }
            value={
              workerOptions.find(
                (opt) => String(opt.value) === String(selectedDoctorId)
              ) || null
            }
            isClearable
            isSearchable
            isLoading={workersLoading}
            className="select-item"
          />
          <CustomSelect
            options={roomOptions}
            onChange={handleRoomChange}
            placeholder="Otaq seç"
            value={selectedRoom}
            isClearable
            isSearchable
            className="select-item"
          />
        </div>

        <div className="schedule-header">
          <div className="date-and-navigation">
            <div className="date-display">
              <div className="current-month">
                {format(currentDate, "MMMM", { locale: az })}
              </div>
              <div className="date-range">{dateRangeText}</div>
            </div>
            <div className="navigation-controls">
              <button className="calendar-button" onClick={toggleCalendar}>
                <FiCalendar />
              </button>
              <button className="nav-button" onClick={goToPreviousWeek}>
                <IoIosArrowBack />
              </button>
              <button className="nav-button" onClick={goToNextWeek}>
                <IoIosArrowForward />
              </button>
              {canCreate && (
                <button
                  className="addNewAppointment"
                  onClick={() => navigate("/appointments/add")}>
                  <TbCalendarPlus className="addNewAppointmentIcon" />
                  Yeni randevu əlavə et
                </button>
              )}
              {showCalendar && (
                <div className="calendar-dropdown" ref={calendarRef}>
                  {/* Calendar buraya əlavə edilə bilər */}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="debug-info mt-4">
          {debugInfo}
          {selectedDoctorId && ` | Seçilmiş həkim ID: ${selectedDoctorId}`}
          {selectedRoom && ` | Seçilmiş otaq: ${selectedRoom.value}`}
          {` | Cəmi randevular: ${appointments.length}`}
        </div>

        <div className="schedule-content">
          <div className="schedule-grid">
            <div className="time-column time-header">
              <div className="time-cell time-header-cell">Saat</div>
            </div>

            {weekDates.map((date, i) => (
              <div key={i} className="day-column day-header">
                <div className="day-cell">
                  <div className="day-name">{WEEKDAYS_SHORT[i]}</div>
                  <div
                    className={`day-date ${
                      isSameDay(date, new Date()) ? "active" : ""
                    }`}>
                    {format(date, "d")}
                  </div>
                </div>
              </div>
            ))}

            <div className="time-column">
              {WORK_HOURS.map((time, i) => (
                <div key={i} className="time-cell">
                  {getTimeSlotLabel(time, i)}
                </div>
              ))}
            </div>

            {weekDates.map((date, dayIndex) => {
              const dayAppointments = appointments.filter((appointment) => {
                if (!appointment.date) return false;
                try {
                  // Portably handle different date formats from API
                  let appointmentDate;
                  if (appointment.date.includes("-")) {
                    appointmentDate = parse(appointment.date, "yyyy-MM-dd", new Date());
                    if (isNaN(appointmentDate)) {
                        appointmentDate = parse(appointment.date, "dd-MM-yyyy", new Date());
                    }
                  } else if (appointment.date.includes(".")) {
                    appointmentDate = parse(appointment.date, "dd.MM.yyyy", new Date());
                  } else {
                    appointmentDate = new Date(appointment.date);
                  }
                  
                  return !isNaN(appointmentDate) && isSameDay(appointmentDate, date);
                } catch (err) {
                  console.error("Date parsing error:", err, appointment.date);
                  return false;
                }
              });

              return (
                <div key={dayIndex} className="day-column">
                  <div
                    className="time-blocks-container"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: `${WORK_HOURS.length * 60}px`, // Dinamik height
                    }}>
                    {WORK_HOURS.map((time, timeIndex) => (
                      <div
                        key={timeIndex}
                        className="schedule-cell-empty"
                        onClick={() =>
                          navigate("/appointments/add", {
                            state: {
                              selectedDateTime: {
                                date: format(date, "yyyy-MM-dd"),
                                time,
                              },
                            },
                          })
                        }></div>
                    ))}

                    {dayAppointments.length === 0 && (
                      <div className="no-appointments">
                        Heç bir randevu yoxdur
                      </div>
                    )}

                    {dayAppointments.map((appointment, apIndex) => (
                      <div
                        key={`${appointment.patientName}-${appointment.date}-${appointment.time}-${apIndex}`}
                        className="appointment-event-block"
                        style={getAppointmentStyle(appointment)}
                        title={`${appointment.patientName} - Pasiyent məlumatlarına baxmaq üçün klikləyin`}
                        onClick={(e) => handleAppointmentClick(e, appointment)}>
                        <div className="appointment-event-content">
                          {appointment.patientName} <br />
                          <small>
                            {appointment.time?.slice(0, 5)} -{" "}
                            {format(
                              addMinutes(
                                parse(appointment.time, "HH:mm:ss", new Date()),
                                parse(
                                  appointment.period,
                                  "HH:mm:ss",
                                  new Date()
                                ).getHours() *
                                  60 +
                                  parse(
                                    appointment.period,
                                    "HH:mm:ss",
                                    new Date()
                                  ).getMinutes()
                              ),
                              "HH:mm"
                            )}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;