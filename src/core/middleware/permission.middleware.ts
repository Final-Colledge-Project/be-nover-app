import { HttpException } from '@core/exceptions';
import { UserSchema } from '@modules/users';

const permissionMiddleware = (roles: string[]) => {
  return async (req: any, res: any, next: any) => {
    const user = await UserSchema.findById(req.user.id).select('+role').exec();
    if (!user) {
      return next(new HttpException(401, 'The user belonging to this token does no longer exist'));
    }
    if (roles.includes(user.role)) {
      next();
    } else {
      next(new HttpException(403, 'Permission denied'));
    }
  };
}

export default permissionMiddleware;
