import axios from "axios";

interface logModel {
    userId: string;
    description: string;
    status: boolean;
}

export enum LogStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
}

export default async function sendLog({userId, description, status}: logModel) {
    const type = status ? LogStatus.SUCCESS : LogStatus.FAILED;
    const url = process.env.SERVICE_LOG_URL || "http://localhost:3001";
    await axios.post(`${url}/logs`, {
        userId,
        description,
        status: type,
    });
}