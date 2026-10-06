import { API_BASE_URL } from "./config";
import axiosInstance from "./temp-axios-auth";

const ORDER_API_URL = `${API_BASE_URL}/order-from-warehouse`;

export const getAllOrdersFromWarehouse = async () => {
  const response = await axiosInstance.get(`${ORDER_API_URL}/read`);
  return response.data;
};

export const getOrderFromWarehouseById = async (id) => {
  const response = await axiosInstance.get(`${ORDER_API_URL}/info/${id}`);
  return response.data;
};

export const createOrderFromWarehouse = async (data) => {
  const response = await axiosInstance.post(`${ORDER_API_URL}/create`, data);
  return response.data;
};

export const updateOrderFromWarehouse = async (data) => {
  const response = await axiosInstance.put(`${ORDER_API_URL}/update`, data);
  return response.data;
};

export const deleteOrderFromWarehouse = async (id) => {
  const response = await axiosInstance.delete(`${ORDER_API_URL}/delete/${id}`);
  return response.data;
};

export const deleteProductFromOrderFromWarehouse = async (orderId, productId) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/delete-order-from-warehouse-product/order-from-warehouse/${orderId}/order-from-warehouse-product/${productId}`
  );
  return response.data;
};

export const searchOrdersFromWarehouse = async (filters) => {
  const response = await axiosInstance.post(`${ORDER_API_URL}/search`, filters);
  return response.data;
};