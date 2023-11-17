import { DataStoredInToken } from '@modules/auth';
import { IUser } from '@modules/users';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const signToken = (userId: string, secretKey: string, expiresIn: string) => {
  return jwt.sign({userId}, secretKey, {expiresIn});
}
