import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import type { User } from '@shared/schema';

import type { Secret } from 'jsonwebtoken';
const JWT_SECRET: Secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(user: User): string;
  verifyToken(token: string): Promise<User | null>;
  authenticateUser(email: string, password: string): Promise<User | null>;
}

class JWTAuthService implements AuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.userId, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await storage.getUserById(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await storage.getUserByEmail(email);
    if (!user) return null;

    const isValid = await this.comparePassword(password, user.password);
    return isValid ? user : null;
  }
}

export const authService = new JWTAuthService();

// Middleware for authentication
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    console.warn('No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Decoded JWT:', decoded);
    const user = await storage.getUserById(decoded.userId);
    console.log('User from DB:', user);
    if (!user) {
      return res.status(403).json({ message: 'Invalid or expired token (user not found)' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware for admin authentication
export const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware for owner authentication
export const requireOwner = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Owner access required' });
  }
  next();
};
