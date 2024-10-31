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
    console.log("sendLog", userId, description, type);
    await axios.post("http://localhost:3001/logs", {
        userId,
        description,
        status: type,
    });
}