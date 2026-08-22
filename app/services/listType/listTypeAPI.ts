import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

export type ListTypeItem = {
  id: number;
  code: string;
  name: string;
  size: string;
  created_at: string;
  updated_at: string;
};

export type CreateListTypePayload = {
  code: string;
  name: string;
  size: string;
};

export type UpdateListTypePayload = {
  code?: string;
  name?: string;
  size?: string;
};

const listTypeAPI = {
  getListTypeAll() {
    return apiServices
      .get(`list-type`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getListTypeAll:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลประเภทรายการล้มเหลว",
          error: err,
        };
      });
  },

  getListTypeById(id: string | number) {
    return apiServices
      .get(`list-type/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getListTypeById:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลประเภทรายการล้มเหลว",
          error: err,
        };
      });
  },

  createListType(payload: CreateListTypePayload) {
    return apiServices
      .post(`list-type`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error createListType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การสร้างประเภทรายการล้มเหลว",
          error: err,
        };
      });
  },

  updateListType(id: string | number, payload: UpdateListTypePayload) {
    return apiServices
      .put(`list-type/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error updateListType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การแก้ไขประเภทรายการล้มเหลว",
          error: err,
        };
      });
  },

  softDeleteListType(id: string | number) {
    return apiServices
      .delete(`list-type/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error softDeleteListType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบประเภทรายการล้มเหลว",
          error: err,
        };
      });
  },

  hardDeleteListType(id: string | number) {
    return apiServices
      .delete(`list-type/${id}/hard`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error hardDeleteListType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบประเภทรายการถาวรล้มเหลว",
          error: err,
        };
      });
  },
};

export default listTypeAPI;
