import { create } from "zustand";
import {
  getDoctors,
  getRooms,
  getRoomPatients,
  getDoctorPatients,
  getPatientDetails,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../src/api/general-calendar"; // Assuming this path is correct

const useGeneralCalendarStore = create((set, get) => ({
  doctors: [],
  rooms: [],
  appointments: [], // This will hold the appointments for the currently selected doctor/room
  selectedPatient: null, // For patient details
  loading: false, // Global loading indicator for API calls
  error: null, // Global error state

  // 🔽 Həkimləri yüklə
  fetchDoctors: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getDoctors();
      set({ doctors: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      set({ error: error.message, loading: false });
    }
  },

  // 🔽 Otaqları yüklə
  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getRooms();
      set({ rooms: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      set({ error: error.message, loading: false });
    }
  },

  // 🔽 Otağa görə pasiyentləri yüklə
  fetchRoomPatients: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const data = await getRoomPatients(roomId);
      set({ appointments: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      if (error?.response?.status === 404) {
        set({ appointments: [], loading: false });
      } else {
        console.error(`Failed to fetch patients for room ${roomId}:`, error);
        set({ error: error.message, loading: false, appointments: [] });
      }
    }
  },

  // 🔽 Həkimə görə pasiyentləri yüklə
  fetchDoctorPatients: async (doctorId) => {
    set({ loading: true, error: null });
    try {
      const data = await getDoctorPatients(doctorId);
      set({ appointments: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      if (error?.response?.status === 404) {
        set({ appointments: [], loading: false });
      } else {
        console.error(`Failed to fetch patients for doctor ${doctorId}:`, error);
        set({ error: error.message, loading: false, appointments: [] });
      }
    }
  },

  // 🔽 Bütün randevuları yüklə (bütün otaqlar üzrə)
  fetchAllAppointments: async () => {
    set({ loading: true, error: null });
    try {
      let roomsData = get().rooms;
      if (!roomsData || roomsData.length === 0) {
        roomsData = await getRooms();
        if (Array.isArray(roomsData)) {
          set({ rooms: roomsData });
        }
      }

      const roomsList = Array.isArray(roomsData) ? roomsData : [];
      const promises = roomsList.map(async (room) => {
        try {
          const res = await getRoomPatients(room.cabinetName);
          return Array.isArray(res) ? res : [];
        } catch (err) {
          return [];
        }
      });

      const allResults = await Promise.all(promises);
      const allAppointments = allResults.flat();

      const seen = new Set();
      const uniqueAppointments = [];
      for (const apt of allAppointments) {
        const key = `${apt.patientName}_${apt.date}_${apt.time}_${apt.cabinetName || ""}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueAppointments.push(apt);
        }
      }

      set({ appointments: uniqueAppointments, loading: false });
    } catch (error) {
      console.error("Failed to fetch all appointments:", error);
      set({ error: error.message, loading: false, appointments: [] });
    }
  },

  // 🔽 Pasiyent detalları
  fetchPatientDetails: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const data = await getPatientDetails(patientId);
      set({ selectedPatient: data, loading: false });
    } catch (error) {
      console.error(`Failed to fetch patient details for ${patientId}:`, error);
      set({ error: error.message, loading: false });
    }
  },

  // 🔽 Yeni təyinat yarat
  addAppointment: async (appointmentData) => {
    set({ loading: true, error: null });
    try {
      const response = await createAppointment(appointmentData);
      // You might want to re-fetch appointments for the current doctor/room after adding
      // const { selectedDoctorId, selectedRoom } = get();
      // if (selectedDoctorId) get().fetchDoctorPatients(selectedDoctorId);
      // else if (selectedRoom) get().fetchRoomPatients(selectedRoom.value);
      set({ loading: false });
      return response; // Return response if needed for confirmation
    } catch (error) {
      console.error("Failed to create appointment:", error);
      set({ error: error.message, loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  // 🔽 Təyinat yenilə
  modifyAppointment: async (appointmentData) => {
    set({ loading: true, error: null });
    try {
      const response = await updateAppointment(appointmentData);
      // Re-fetch logic similar to addAppointment
      set({ loading: false });
      return response;
    } catch (error) {
      console.error("Failed to update appointment:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 🔽 Təyinat sil
  removeAppointment: async (appointmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await deleteAppointment(appointmentId);
      // Re-fetch logic similar to addAppointment
      set({ loading: false });
      return response;
    } catch (error) {
      console.error(`Failed to delete appointment ${appointmentId}:`, error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

export default useGeneralCalendarStore;