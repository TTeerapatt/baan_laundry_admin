import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

export type ServiceTypeItem = {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CreateServiceTypePayload = {
  code: string;
  name: string;
};

export type UpdateServiceTypePayload = {
  code?: string;
  name?: string;
};

const serviceTypeAPI = {
  getServiceTypeAll() {
    return apiServices
      .get(`service-type`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getServiceTypeAll:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลประเภทบริการล้มเหลว",
          error: err,
        };
      });
  },

  getServiceTypeById(id: string | number) {
    return apiServices
      .get(`service-type/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getServiceTypeById:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลประเภทบริการล้มเหลว",
          error: err,
        };
      });
  },

  createServiceType(payload: CreateServiceTypePayload) {
    return apiServices
      .post(`service-type`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error createServiceType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การสร้างประเภทบริการล้มเหลว",
          error: err,
        };
      });
  },

  updateServiceType(id: string | number, payload: UpdateServiceTypePayload) {
    return apiServices
      .put(`service-type/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error updateServiceType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การแก้ไขประเภทบริการล้มเหลว",
          error: err,
        };
      });
  },

  softDeleteServiceType(id: string | number) {
    return apiServices
      .delete(`service-type/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error softDeleteServiceType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบประเภทบริการล้มเหลว",
          error: err,
        };
      });
  },

  hardDeleteServiceType(id: string | number) {
    return apiServices
      .delete(`service-type/${id}/hard`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error hardDeleteServiceType:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบประเภทบริการถาวรล้มเหลว",
          error: err,
        };
      });
  },
};

export default serviceTypeAPI;
