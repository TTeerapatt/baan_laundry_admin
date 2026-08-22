import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

export type OrderItem = {
  id: number;
  order_id: number;
  service_type_id: number;
  list_type_id: number;
  list_price_id: number | null;
  qty: number;
  unit_price: string;
  line_total: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderListItem = {
  id: number;
  ticket_no: string;
  user_id: number;
  admin_id: number | null;
  status: string;
  payment_status: string;
  subtotal: string;
  discount: string;
  total: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  user_phone?: string | null;
  user_name?: string | null;
};

export type OrderDetail = OrderListItem & {
  items: OrderItem[];
};

export type OrderListQuery = {
  ticket_no?: string;
  status?: string;
  payment_status?: string;
  phone?: string;
  date_from?: string;
  date_to?: string;
};

export type CreateOrderItemPayload = {
  list_price_id?: number;
  service_type_id?: number;
  list_type_id?: number;
  qty: number;
  note?: string;
};

export type CreateOrderPayload = {
  user_id: number;
  discount?: number;
  note?: string;
  items: CreateOrderItemPayload[];
};

export type UpdateOrderPayload = {
  user_id?: number;
  status?: string;
  payment_status?: string;
  discount?: number;
  note?: string | null;
};

export type UpdateOrderStatusPayload = {
  status: string;
};

export type UpdateOrderPaymentStatusPayload = {
  payment_status: string;
};

export type OrderLogItem = {
  id: number;
  order_id: number;
  admin_id: number | null;
  from_status: string | null;
  to_status: string | null;
  action: string;
  message: string | null;
  created_at: string;
  updated_at: string;
};

const orderAPI = {
  getOrderAll(params?: OrderListQuery) {
    return apiServices
      .get(`orders`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        params,
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getOrderAll:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  getOrderById(id: string | number) {
    return apiServices
      .get(`orders/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getOrderById:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  getOrderLogs(id: string | number) {
    return apiServices
      .get(`orders/${id}/logs`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getOrderLogs:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงประวัติออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  createOrder(payload: CreateOrderPayload) {
    return apiServices
      .post(`orders`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error createOrder:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การสร้างออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  updateOrder(id: string | number, payload: UpdateOrderPayload) {
    return apiServices
      .put(`orders/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error updateOrder:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การแก้ไขออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  updateOrderStatus(id: string | number, payload: UpdateOrderStatusPayload) {
    return apiServices
      .patch(`orders/${id}/status`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error updateOrderStatus:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การอัปเดตสถานะออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  updateOrderPaymentStatus(
    id: string | number,
    payload: UpdateOrderPaymentStatusPayload
  ) {
    return apiServices
      .patch(`orders/${id}/payment-status`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error updateOrderPaymentStatus:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การอัปเดตสถานะการชำระเงินล้มเหลว",
          error: err,
        };
      });
  },

  softDeleteOrder(id: string | number) {
    return apiServices
      .delete(`orders/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error softDeleteOrder:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบออเดอร์ล้มเหลว",
          error: err,
        };
      });
  },

  hardDeleteOrder(id: string | number) {
    return apiServices
      .delete(`orders/${id}/hard`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error hardDeleteOrder:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การลบออเดอร์ถาวรล้มเหลว",
          error: err,
        };
      });
  },
};

export default orderAPI;
