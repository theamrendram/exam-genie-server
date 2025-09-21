import { RequestHandler } from "express";
import cloudinary from "../utils/cloudinary";
import queue from "../utils/queue";

const uploadController: RequestHandler = async (req, res) => {
  console.log("calling upload controller");
  const file = req.file;
  console.log("file: ", file);
  if (!file) {
    return res.status(400).json({ message: "File is required" });
  }
  const uploadedFile = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder: process.env.CLOUDINARY_FOLDER,
    },
  );
  console.log("uploadedFile: ", uploadedFile);
  const job = await queue.add("pdf-upload-job", {
    filename: file.originalname,
    path: uploadedFile.secure_url,
  });
  console.log("job: ", job);
  res.json({ message: "File uploaded successfully", jobId: job.id });
};

export { uploadController };
