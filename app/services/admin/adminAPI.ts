import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

const adminAPI = {

    loginAdmin(email: string, password: string) {
        return apiServices
            .post(
                `auth/login`,
                { email, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error loginAdmin:", err);
                return {
                    status: "failed",
                    errMessage:
                        err?.message ||
                        err?.errMessage ||
                        (typeof err === "string" ? err : null) ||
                        "การเข้าสู่ระบบล้มเหลว",
                    error: err,
                };
            });
    },

}

export default adminAPI;