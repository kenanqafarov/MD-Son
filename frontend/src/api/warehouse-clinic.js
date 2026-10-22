import { API_BASE_URL } from "./config";
// src/services/warehouseService.js
import axiosInstance from '../api/temp-axios-auth';



const warehouseClinic = {
  searchWarehouse: async (searchPayload) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/warehouse/search-warehouse`,
        searchPayload
      );
      return response.data;
    } catch (error) {
      console.error('Error searching warehouse:', error);
      throw error;
    }
  },

  readWarehouse: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/warehouse/read-warehouse`
      );
      return response.data;
    } catch (error) {
      console.error('Error reading warehouse:', error);
      throw error;
    }
  },
};

export default warehouseClinic;
