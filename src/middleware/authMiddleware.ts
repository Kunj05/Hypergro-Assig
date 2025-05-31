import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'Not authorized' });
        return; // ✅ ensure void return
      }

      req.user = { id: (user as { _id: { toString: () => string } })._id.toString() };
      return next(); // ✅ void return here too
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Invalid token' });
      return; // ✅ ensure void return
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
    return; // ✅ ensure void return
  }
};
