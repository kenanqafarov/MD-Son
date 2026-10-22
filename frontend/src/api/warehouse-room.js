import { API_BASE_URL } from "./config";
import axiosInstance from '../api/temp-axios-auth';



const warehouseStockRoomApiService = {
  searchRoomStock: async (searchPayload) => {
    try {
      console.log('Searching room stock:', JSON.stringify(searchPayload, null, 2));
      const response = await axiosInstance.post(`${API_BASE_URL}/room-stock/search`, searchPayload);
      return { data: response.data };
    } catch (error) {
      console.error('Error in room stock search:', error);
      throw error;
    }
  },
};

export default warehouseStockRoomApiService;