import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

const adminAPI = {

    loginAdmin(username: string, password: string) {
        return apiServices
            .post(
                `/api/admin/login`,
                { username, password },
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error loginAdmin:", err);
                return {
                    status: "failed",
                    errMessage: err?.message || err,
                    error: err,
                };
            });
    },

    createAdmin(adminData: any) {
        return apiServices
            .post(
                `/api/admin/create`,
                adminData || {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error createAdmin:", err);
                return {
                    status: "failed",
                    errMessage: err?.message || err,
                    error: err,
                };
            });
    },

    getAllAdmin() {
        return apiServices
            .get(`/api/admin`, {
                headers: {
                    Accept: "application/json",
                },
            })
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error getAllAdmin:", err);
                return {
                    status: "failed",
                    errMessage: err?.message || err,
                    error: err,
                };
            });
    },

    updateAdmin(id: string | number, data: any) {
        return apiServices
            .patch(
                `/api/admin/${id}`,
                data || {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error updateAdmin:", err);
                return {
                    status: "failed",
                    errMessage: err?.message || err,
                    error: err,
                };
            });
    },

    softDeleteAdmin(id: string | number) {
        return apiServices
            .patch(
                `/api/admin/${id}/soft-delete`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error softDeleteAdmin:", err);
                return {
                    status: "failed",
                    errMessage: err?.message || err,
                    error: err,
                };
            });
    },

}

export default adminAPI;