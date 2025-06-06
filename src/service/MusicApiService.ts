import {Music, Prisma} from "@prisma/client";
import axios from "axios";
import Variables from "@/config/Variables";
import CustomError from "@/middleware/CustomError";
import Service from "@/service/Service";
import {GenerateMusicPayload, MusicApiResponse} from "@/types/music";
import MusicWorker from "@/workers/MusicWorker";

class MusicApiService extends Service {
    private static baseUrl = "https://api.musicapi.ai/api/v1/sonic";

    public static async generateMusic(payload: GenerateMusicPayload, userId?: string, telegramUserId?: string): Promise<Music> {
        try {
            const response = await axios.post<MusicApiResponse>(
                `${this.baseUrl}/create`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Variables.MUSIC_API_KEY}`
                    }
                }
            );

            const taskId = response.data.task_id;

            if (userId) {
                await this.prisma.user.update({
                    where: {id: userId},
                    data: {point: {increment: 10}},
                });
            }

            const music = await this.prisma.music.create({
                data: {taskId, userId, telegramUserId, state: "pending"}
            });

            MusicWorker.addToQueue(taskId);
            return music;
        } catch (error: any) {
            throw new CustomError(`Failed to generate music: ${error.response?.data?.error || error.message}`, 500);
        }
    }

    public static async getMusicResult(taskId: string): Promise<Music> {
        try {
            await this.prisma.music.updateMany({
                where: {taskId},
                data: {totalView: {increment: 1}},
            });
            return await this.prisma.music.findFirstOrThrow({
                where: {taskId}, include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            });
        } catch (error: any) {
            this.handleError(new CustomError("Failed to fetch music result", 500));
            throw error;
        }
    }

    public static async getUserMusic(userId: string): Promise<Music[]> {
        try {
            return await this.prisma.music.findMany({
                where: {userId},
                orderBy: {createdAt: Prisma.SortOrder.desc}
            });
        } catch (error) {
            this.handleError(new CustomError("Failed to fetch user music", 500));
            throw error;
        }
    }

    public static async getTelegramMusic(telegramUserId: string): Promise<Music[]> {
        try {
            return await this.prisma.music.findMany({
                where: {telegramUserId},
                orderBy: {createdAt: Prisma.SortOrder.desc}
            });
        } catch (error) {
            this.handleError(new CustomError("Failed to fetch telegram music", 500));
            throw error;
        }
    }

    public static async getAllMusic(): Promise<Music[]> {
        try {
            return await this.prisma.music.findMany({
                where: {
                    userId: {
                        not: null
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            });
        } catch (error) {
            this.handleError(new CustomError("Failed to fetch all meshes", 500));
            throw error;
        }
    }
}

export default MusicApiService;
