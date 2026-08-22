import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

export type ListPriceItem = {
  id: number;
  service_type_id: number;
  list_type_id: number;
  unit_price: string;
  created_at: string;
  updated_at: string;
};

export type CreateListPricePayload = {
  service_type_id: number;
  list_type_id: number;
  unit_price: number;
};

export type UpdateListPricePayload = {
  service_type_id?: number;
  list_type_id?: number;
  unit_price?: number;
};

const listPriceAPI = {
  getListPriceAll() {
    return apiServices
      .get(`list-price`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getListPriceAll:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลราคาล้มเหลว",
          error: err,
        };
      });
  },

  getListPriceById(id: string | number) {
    return apiServices
      .get(`list-price/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getListPriceById:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลราคาล้มเหลว",
          error: err,
        };
      });
  },

  createListPrice(payload: CreateListPricePayload) {
    return apiServices
      .post(`list-price`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error createListPrice:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การสร้างราคาล้มเหลว",
          error: err,
        };
      });
  },

  updateListPrice(id: string | number, payload: UpdateListPricePayload) {
    return apiServices
      .put(`list-price/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error updateListPrice:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การแก้ไขราคาล้มเหลว",
          error: err,
        };
      });
  },

  softDeleteListPrice(id: string | number) {
    return apiServices
      .delete(`list-price/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error softDeleteListPrice:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบราคาล้มเหลว",
          error: err,
        };
      });
  },

  hardDeleteListPrice(id: string | number) {
    return apiServices
      .delete(`list-price/${id}/hard`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error hardDeleteListPrice:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบราคาถาวรล้มเหลว",
          error: err,
        };
      });
  },
};

export default listPriceAPI;
