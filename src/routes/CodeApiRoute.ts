import {Router} from "express";
import Auth from "@/middleware/Auth";
import CodeValidation from "@/validation/CodeValidation";
import CodeApiController from "@/controller/CodeApiController";
import MeshyApiController from "@/controller/MeshyApiController";
class CodeApiRoute {
    private static router = Router();

    public static route(): Router {
        this.router.post("/generate", Auth.authorize(), CodeValidation.generateCode(), CodeApiController.generateCode);
        this.router.get("/user", Auth.authorize(), CodeApiController.getUserCode);
        this.router.get("/result/:id", CodeApiController.getCodeResult);

        return this.router;
    }
}

export default CodeApiRoute;
