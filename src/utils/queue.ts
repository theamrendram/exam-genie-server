import { Queue } from "bullmq";

const queue = new Queue("pdf-upload-queue", {
    connection : {
        host : process.env.REDIS_HOST,
        port : Number(process.env.REDIS_PORT),
    }
});

export default queue;