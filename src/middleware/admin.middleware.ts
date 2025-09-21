import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prisma-client";

interface RequestWithAuth extends Request {
  auth: any;
}

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as unknown as RequestWithAuth).auth().userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default requireAdmin;
