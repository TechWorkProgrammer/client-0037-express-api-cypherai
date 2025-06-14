import Variables from "@/config/Variables";
import CustomError from "@/middleware/CustomError";
import Service from "@/service/Service";

import OpenAI from "openai";
import {GeneratedCode, Prisma} from "@prisma/client";

const openai = new OpenAI({
    apiKey: Variables.OPENAI_API_KEY,
});

interface GenerateCodePayload {
    prompt: string;
}

class OpenAiCodeService extends Service {
    public static async generateCode(
        payload: GenerateCodePayload,
        userId?: string
    ): Promise<GeneratedCode> {

        const systemPrompt = `
                          You are a code generator. Always respond with valid JSON only, without any comments or extra text.
                          The JSON must have exactly these top-level keys: "html", "css", "js".
                          Each key maps to an object whose keys are filenames (e.g. "index.html", "style.css", "script.js") 
                          and values are the full content of that file.
                          Example output:
                          {
                            "html": {
                              "index.html": "<!DOCTYPE html> ...",
                              "about.html": "<!DOCTYPE html> ..."
                            },
                            "css": {
                              "style.css": "body { ... }"
                            },
                            "js": {
                              "script.js": "console.log('hello');"
                            }
                          }
                          `;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {role: "system", content: systemPrompt},
                    {role: "user", content: payload.prompt},
                ],
                temperature: 0.3,
                max_tokens: 5000,
            });

            const raw = completion.choices[0].message?.content ?? "";
            let json: Record<string, any>;
            json = JSON.parse(raw);

            const code = await this.prisma.generatedCode.create({
                data: {
                    userId,
                    prompt: payload.prompt,
                    result: json,
                },
            });

            if (userId) {
                await this.prisma.user.update({
                    where: {id: userId},
                    data: {
                        point: {increment: 10},
                    },
                });
            }

            return code;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || "Unknown error";
            this.handleError(new CustomError(`Failed to generate code: ${msg}`, 500));
            throw new CustomError(`Failed to generate code: ${msg}`, 500);
        }
    }

    public static async getUserCode(userId: string): Promise<GeneratedCode[]> {
        try {
            return await this.prisma.generatedCode.findMany({
                where: {userId},
                orderBy: {createdAt: Prisma.SortOrder.desc}
            });
        } catch (error) {
            this.handleError(new CustomError("Failed to fetch user code", 500));
            throw error;
        }
    }

    public static async getCodeResult(id: string): Promise<GeneratedCode> {
        try {
            return await this.prisma.generatedCode.findFirstOrThrow({
                where: {id}
            });
        } catch (error: any) {
            this.handleError(new CustomError("Failed to fetch code result", 500));
            throw error;
        }
    }
}

export default OpenAiCodeService;
