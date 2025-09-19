import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("cookies: ", req.cookies); 
  const token = req.cookies?.token; 
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("decoded: ", decoded);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
