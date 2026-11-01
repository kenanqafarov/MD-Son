import { API_BASE_URL } from "../../api/config";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCalendar,
  FiUserCheck,
  FiFilter,
} from "react-icons/fi";
import "./EmployeeSchedule.css";

// Həftə günləri və qısa adlar
const weekDays = [
  { key: "MONDAY", label: "Bazar ertəsi", short: "B.e" },
  { key: "TUESDAY", label: "Çərşənbə axşamı", short: "Ç.a" },
  { key: "WEDNESDAY", label: "Çərşənbə", short: "Ç." },
  { key: "THURSDAY", label: "Cümə axşamı", short: "C.a" },
  { key: "FRIDAY", label: "Cümə", short: "C." },
  { key: "SATURDAY", label: "Şənbə", short: "Ş." },
  { key: "SUNDAY", label: "Bazar", short: "B." },
];

const azMonths = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekDates(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const blockColors = ["blue", "green", "pink", "red"];
function getBlockColor(idx) {
  return blockColors[idx % blockColors.length];
}

function generateTimeIntervals(startTime, endTime) {
  const intervals = [];
  const start = startTime.split(":").map(Number);
  const end = endTime.split(":").map(Number);

  let hour = start[0];
  let minute = start[1];

  while (hour < end[0] || (hour === end[0] && minute < end[1])) {
    intervals.push({
      hour,
      minute,
      timeStr: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`,
    });

    minute += 30;
    if (minute >= 60) {
      hour += 1;
      minute -= 60;
    }
  }

  return intervals;
}

function getIntervalCount(startTime, endTime) {
  const start = startTime.split(":").map(Number);
  const end = endTime.split(":").map(Number);

  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  const minutes = endMinutes - startMinutes;
  return Math.ceil(minutes / 30);
}

const EmployeeSchedule = () => {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cascading filters
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const weekDates = getWeekDates(weekStart);
  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
  const monthName = azMonths[weekStart.getMonth()];
  const rangeStr = `${weekDates[0].getDate()} ${monthName} - ${weekDates[6].getDate()} ${
    azMonths[weekDates[6].getMonth()]
  }`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Giriş tokeni tapılmadı");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [
          employeesResponse,
          schedulesResponse,
          roomsResponse,
          permissionsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/add-worker/read`, { headers }),
          fetch(`${API_BASE_URL}/workers-work-schedule/read`, { headers }),
          fetch(`${API_BASE_URL}/general-calendar/read-rooms`, { headers }),
          fetch(`${API_BASE_URL}/permission/read`, { headers }).catch(() => null),
        ]);

        if (!employeesResponse.ok)
          throw new Error(`İşçiləri gətirmək mümkün olmadı: ${employeesResponse.status}`);
        if (!schedulesResponse.ok)
          throw new Error(`İş qrafikini gətirmək mümkün olmadı: ${schedulesResponse.status}`);
        if (!roomsResponse.ok)
          throw new Error(`Otaqları gətirmək mümkün olmadı: ${roomsResponse.status}`);

        const employeesData = await employeesResponse.json();
        const schedulesData = await schedulesResponse.json();
        const roomsData = await roomsResponse.json();

        let rolesList = [];
        if (permissionsResponse && permissionsResponse.ok) {
          const permsData = await permissionsResponse.json();
          rolesList = permsData.map((p) => p.permissionName || p);
        } else {
          const roleSet = new Set();
          employeesData.forEach((emp) => {
            if (Array.isArray(emp.permissions)) {
              emp.permissions.forEach((p) => roleSet.add(p));
            }
          });
          rolesList = Array.from(roleSet);
        }

        setEmployees(employeesData);
        setSchedules(schedulesData);
        setRooms(roomsData);
        setRoles(rolesList);
      } catch (err) {
        console.error("API Xətası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weekStart]);

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(getMonday(prev));
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(getMonday(next));
  };

  // Cascading role filter change
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    // If current selected employee does not have the newly selected role, reset employee filter
    if (selectedEmployee) {
      const currentEmp = employees.find((x) => x.id === selectedEmployee);
      if (!currentEmp || !currentEmp.permissions?.includes(role)) {
        setSelectedEmployee("");
      }
    }
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedRole("");
    setSelectedEmployee("");
    setSelectedRoom("");
  };

  // Employees available for the second dropdown based on selectedRole
  const availableEmployeesForDropdown = useMemo(() => {
    if (!selectedRole) return employees;
    return employees.filter(
      (emp) => Array.isArray(emp.permissions) && emp.permissions.includes(selectedRole)
    );
  }, [employees, selectedRole]);

  function getScheduleForEmployeeAndDay(userId, weekDay) {
    return schedules.find(
      (s) =>
        s.userId === userId &&
        s.weekDay === weekDay &&
        (!selectedRoom || s.cabinetName === selectedRoom)
    );
  }

  // Filtered employees for schedule table
  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (selectedRole) {
      result = result.filter(
        (e) => Array.isArray(e.permissions) && e.permissions.includes(selectedRole)
      );
    }
    if (selectedEmployee) {
      result = result.filter((e) => e.id === selectedEmployee);
    } else if (selectedRoom) {
      const employeeIdsWithRoom = new Set(
        schedules
          .filter((s) => s.cabinetName === selectedRoom)
          .map((s) => s.userId)
      );
      result = result.filter((e) => employeeIdsWithRoom.has(e.id));
    }
    return result;
  }, [employees, schedules, selectedRole, selectedEmployee, selectedRoom]);

  const showDetailedView = useMemo(
    () => Boolean(selectedEmployee || selectedRoom),
    [selectedEmployee, selectedRoom]
  );

  if (error) {
    return (
      <div className="employeeScheduleContainer">
        <div className="schedule-out text-center py-10">
          <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-3">
            <FiX size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Xəta baş verdi</h3>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employeeScheduleContainer">
      <div className="schedule-out">
        {/* Header & Filter Controls */}
        <div className="schedule-header flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="search-and-selects flex flex-wrap items-center gap-3">
            {/* 1. Filter: Role / Permission */}
            <div className="relative">
              <select
                className="ews-filter-select !min-w-[170px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedRole}
                onChange={handleRoleChange}>
                <option value="">İcazə / Peşə (Hamısı)</option>
                {roles.map((role, idx) => (
                  <option key={idx} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Filter: Employee (cascaded by role) */}
            <div className="relative">
              <select
                className="ews-filter-select !min-w-[170px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedEmployee}
                onChange={handleEmployeeChange}>
                <option value="">İşçi seçin</option>
                {availableEmployeesForDropdown.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.surname}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filter: Room */}
            <div className="relative">
              <select
                className="ews-filter-select !min-w-[130px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedRoom}
                onChange={handleRoomChange}>
                <option value="">Otaq (Hamısı)</option>
                {rooms.map((room) => (
                  <option key={room.cabinetName} value={room.cabinetName}>
                    {room.cabinetName}
                  </option>
                ))}
              </select>
            </div>

            {(selectedRole || selectedEmployee || selectedRoom) && (
              <button
                className="ews-filter-btn flex items-center gap-1 px-3 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-medium transition cursor-pointer"
                onClick={handleClearFilters}
                title="Filterləri sıfırla">
                <FiX /> Sıfırla
              </button>
            )}
          </div>

          {/* Date Range & Navigation */}
          <div className="date-and-navigation flex items-center justify-between md:justify-end gap-4">
            <div className="date-display text-left md:text-right">
              <div className="current-month font-bold text-gray-800 text-base flex items-center gap-2">
                <FiCalendar className="text-blue-600" /> {monthName} {weekStart.getFullYear()}
              </div>
              <div className="date-range text-xs text-gray-500 font-medium">{rangeStr}</div>
            </div>
            <div className="navigation-controls flex items-center gap-2">
              <button
                className="nav-button p-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-700 transition"
                onClick={handlePrevWeek}
                title="Əvvəlki həftə">
                <FiChevronLeft size={18} />
              </button>
              <button
                className="nav-button p-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-700 transition"
                onClick={handleNextWeek}
                title="Növbəti həftə">
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">Qrafik məlumatları yüklənir...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 my-4">
            <FiFilter className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 font-medium">Seçilmiş filterlərə uyğun işçi tapılmadı</p>
            <button
              onClick={handleClearFilters}
              className="mt-3 text-sm text-blue-600 hover:underline">
              Bütün filterləri sıfırla
            </button>
          </div>
        ) : (
          <div className="table-scroll-container overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="ews-table w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  <th
                    className="text-left px-4 py-3 font-semibold text-gray-700 text-sm"
                    style={{ width: showDetailedView ? "auto" : "180px" }}>
                    İşçi
                  </th>
                  {weekDates.map((d, i) => {
                    const isToday = isSameDay(weekDates[i], today);
                    return (
                      <th
                        key={i}
                        className={`dateContainerTH px-2 py-3 text-center border-l border-gray-100 ${
                          isToday ? "current-day-header bg-blue-50/70" : ""
                        }`}>
                        <div
                          className={`day-name text-xs uppercase tracking-wider font-semibold ${
                            isToday ? "text-blue-600 font-bold" : "text-gray-500"
                          }`}>
                          {weekDays[i].short}
                        </div>
                        <div
                          className={`day-date text-base font-bold mt-0.5 ${
                            isToday
                              ? "bg-blue-600 text-white w-7 h-7 rounded-full inline-flex items-center justify-center mx-auto"
                              : "text-gray-800"
                          }`}>
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {showDetailedView
                  ? filteredEmployees.map((emp, empIdx) => {
                      let minHour = 9,
                        maxHour = 18;
                      weekDays.forEach((d) => {
                        const sched = getScheduleForEmployeeAndDay(emp.id, d.key);
                        if (
                          sched &&
                          typeof sched.startTime === "string" &&
                          typeof sched.finishTime === "string"
                        ) {
                          const startHour = Number.parseInt(sched.startTime.split(":")[0]);
                          const endHour = Number.parseInt(sched.finishTime.split(":")[0]);
                          minHour = Math.min(minHour, startHour);
                          maxHour = Math.max(maxHour, endHour);
                        }
                      });

                      const intervals = generateTimeIntervals(
                        `${String(minHour).padStart(2, "0")}:00`,
                        `${String(maxHour + 1).padStart(2, "0")}:00`
                      );

                      const empSchedules = weekDays.map((d) =>
                        getScheduleForEmployeeAndDay(emp.id, d.key)
                      );
                      const blockRendered = Array(weekDays.length).fill(false);

                      return intervals.map((interval, intervalIdx) => (
                        <tr key={`${emp.id}-${intervalIdx}`} className="hover:bg-slate-50/50">
                          {intervalIdx === 0 && (
                            <td
                              className="vertical-header p-4 bg-white border-r border-gray-200"
                              rowSpan={intervals.length}>
                              <div className="flex flex-col items-center justify-center text-center">
                                <img
                                  src={
                                    emp.profilePhotoPath ||
                                    `https://avatar.iran.liara.run/username?username=${emp.name}+${emp.surname}`
                                  }
                                  alt="avatar"
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm mb-2"
                                />
                                <div className="font-semibold text-gray-900 text-sm">
                                  {emp.name} {emp.surname}
                                </div>
                                {emp.permissions && emp.permissions.length > 0 && (
                                  <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                                    {emp.permissions.slice(0, 2).join(", ")}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          {weekDays.map((d, dayIdx) => {
                            const sched = empSchedules[dayIdx];
                            const intervalTime = interval.hour * 60 + interval.minute;
                            const isTimeSlotInSchedule =
                              sched &&
                              typeof sched.startTime === "string" &&
                              typeof sched.finishTime === "string" &&
                              intervalTime >=
                                Number.parseInt(sched.startTime.split(":")[0]) * 60 +
                                  Number.parseInt(sched.startTime.split(":")[1]) &&
                              intervalTime <
                                Number.parseInt(sched.finishTime.split(":")[0]) * 60 +
                                  Number.parseInt(sched.finishTime.split(":")[1]);

                            if (!sched) return <td key={d.key} className="empty-cell"></td>;

                            if (!blockRendered[dayIdx] && isTimeSlotInSchedule) {
                              const span = getIntervalCount(sched.startTime, sched.finishTime);
                              blockRendered[dayIdx] = true;
                              return (
                                <td
                                  key={d.key}
                                  rowSpan={span}
                                  className="schedule-cell p-1 align-top">
                                  <div
                                    className={`ews-schedule-block ews-schedule-block-${getBlockColor(
                                      empIdx
                                    )} vertical-view shadow-sm rounded-lg p-2.5 flex flex-col justify-between`}
                                    style={{ height: 60 * span - 8 }}>
                                    <div>
                                      <div className="block-doctor font-bold text-xs">
                                        {emp.name} {emp.surname}
                                      </div>
                                      <div className="block-time text-[11px] opacity-90 mt-0.5">
                                        {formatTime(sched.startTime)} -{" "}
                                        {formatTime(sched.finishTime)}
                                      </div>
                                    </div>
                                    <div className="block-room text-[10px] font-semibold bg-white/30 backdrop-blur-xs px-2 py-0.5 rounded mt-1 text-center">
                                      {sched.cabinetName}
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            if (blockRendered[dayIdx] && isTimeSlotInSchedule) return null;
                            return <td key={d.key} className="empty-cell"></td>;
                          })}
                        </tr>
                      ));
                    })
                  : filteredEmployees.map((emp, empIdx) => (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                emp.profilePhotoPath ||
                                `https://avatar.iran.liara.run/username?username=${emp.name}+${emp.surname}`
                              }
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-xs"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-800">
                                {emp.name} {emp.surname}
                              </div>
                              {emp.permissions && emp.permissions.length > 0 && (
                                <div className="text-[11px] text-gray-400">
                                  {emp.permissions.slice(0, 2).join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {weekDays.map((d, dayIdx) => {
                          const sched = getScheduleForEmployeeAndDay(emp.id, d.key);
                          return (
                            <td key={d.key} className="px-2 py-3 text-center border-l border-gray-100">
                              {sched ? (
                                <div
                                  className={`ews-schedule-block ews-schedule-block-${getBlockColor(
                                    dayIdx
                                  )} shadow-xs rounded-lg px-2.5 py-1.5 inline-block text-left w-full max-w-[130px]`}>
                                  <div className="text-xs font-semibold">
                                    {formatTime(sched.startTime)} -{" "}
                                    {formatTime(sched.finishTime)}
                                  </div>
                                  <div className="ews-room text-[10px] opacity-80 mt-0.5">
                                    📍 {sched.cabinetName}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSchedule;
