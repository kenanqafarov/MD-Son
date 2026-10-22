import { API_BASE_URL } from "./config";
import axiosInstance from "./temp-axios-auth";

const GENERAL_CALENDAR_URL = `${API_BASE_URL}/general-calendar`;

// 🔽 Həkimlər
export const getDoctors = async () => {
  const response = await axiosInstance.get(`${GENERAL_CALENDAR_URL}/read-doctors`);
  return response.data;
};

// 🔽 Otaqlar
export const getRooms = async () => {
  const response = await axiosInstance.get(`${GENERAL_CALENDAR_URL}/read-rooms`);
  return response.data;
};

// 🔽 Randevu yarat
export const createAppointment = async (appointmentData) => {
  const response = await axiosInstance.post(
    `${GENERAL_CALENDAR_URL}/new-appointment`,
    appointmentData
  );
  return response.data;
};

// 🔽 Randevu yenilə
export const updateAppointment = async (appointmentData) => {
  const response = await axiosInstance.put(
    `${GENERAL_CALENDAR_URL}/update-appointment`,
    appointmentData
  );
  return response.data;
};

// 🔽 Randevu sil
export const deleteAppointment = async (id) => {
  const response = await axiosInstance.delete(
    `${GENERAL_CALENDAR_URL}/delete-appointment/${id}`
  );
  return response.data;
};

// 🔽 Otağa görə randevular
export const getRoomPatients = async (cabinetName) => {
  const response = await axiosInstance.get(
    `${GENERAL_CALENDAR_URL}/selecting-room-viewing-patient/${cabinetName}`
  );
  return response.data;
};

// 🔽 Pasiyent detalları
export const getPatientDetails = async (patientId) => {
  const response = await axiosInstance.get(
    `${GENERAL_CALENDAR_URL}/selecting-patient-to-read/${patientId}`
  );
  return response.data;
};

// 🔽 Həkimə görə randevular
export const getDoctorPatients = async (doctorId) => {
  const response = await axiosInstance.get(
    `${GENERAL_CALENDAR_URL}/selecting-doctor-viewing-patient/${doctorId}`
  );
  return response.data;
};
