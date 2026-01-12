import { Request, Response, NextFunction } from "express";

const errorHandler = (err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
};

export default errorHandler;
