import { RequestHandler } from "express";
import cloudinary from "../utils/cloudinary";
import prisma from "../utils/prisma-client";
import queue from "../utils/queue";

interface RequestWithAuth extends Request {
  auth: any;
}

const uploadPDF: RequestHandler = async (req, res) => {
  console.log("calling upload controller");
  console.log("req.file:", req.file);
  const file = req.file;
  const userId = (req as unknown as RequestWithAuth).auth().userId;
  const { title, subject, semester } = req.body;

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

  await prisma.uploadedPDF.create({
    data: {
      title: title,
      path: uploadedFile.secure_url,
      userId: userId,
      subject: subject,
      semester: semester,
      user: {
        connect: { id: userId },
      },
    },
  });

  console.log("uploadedFile: ", uploadedFile);
  const job = await queue.add("pdf-upload-job", {
    filename: file.originalname,
    path: uploadedFile.secure_url,
    fileBuffer: file.buffer.toString("base64"),
    mimeType: file.mimetype,
  });
  console.log("job: ", job);
  res.json({ message: "File uploaded successfully", jobId: job.id });
};

const getPDFsByUserId: RequestHandler = async (req, res) => {
  const userId = (req as unknown as RequestWithAuth).auth?.userId;
  const pdfs = await prisma.uploadedPDF.findMany({
    where: { userId: userId },
  });
  res.json(pdfs);
};

export { uploadPDF, getPDFsByUserId };
