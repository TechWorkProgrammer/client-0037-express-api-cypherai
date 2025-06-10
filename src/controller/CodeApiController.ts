import {Request, Response} from "express";
import ResponseHelper from "@/config/Response";
import OpenAiCodeService from "@/service/OpenAiCodeService";

class CodeApiController {
    public static async generateCode(req: Request, res: Response): Promise<void> {
        const userId = res.locals.user.id;
        const payload = req.body;

        const data = await OpenAiCodeService.generateCode(payload, userId);
        ResponseHelper.Created(res, "Code generation started", data);
    }

    public static async getUserCode(req: Request, res: Response): Promise<void> {
        const userId = res.locals.user.id;
        const data = await OpenAiCodeService.getUserCode(userId);
        ResponseHelper.Success(res, "User code fetched", data);
    }

    public static async getCodeResult(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        const data = await OpenAiCodeService.getCodeResult(id);
        ResponseHelper.Success(res, "Code result fetched", data);
    }
}

export default CodeApiController;
