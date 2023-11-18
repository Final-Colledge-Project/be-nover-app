import RegisterDto from "./dtos/register.dto";
import UserSchema from "./user.model";
import { Email, Logger, isEmptyObject, signToken } from "@core/utils";
import { HttpException } from "@core/exceptions";
import bcrypt from "bcrypt";
import IUser from "./user.interface";
import jwt from "jsonwebtoken";
import UpdateUserDto from "./dtos/updateUser.dto";
import ChangePasswordDto from "./dtos/changePasswordDto";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
class UserService {
  private userSchema = UserSchema;

  public async createUser(model: RegisterDto, req: Request): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email }).select('+verify +password').exec();
    
    if (user) {
      if (user.verify === true && !!user.password) {
        throw new HttpException(409, `User with email ${model.email} already exists`);
      }
      else if (!user.verify){
        throw new HttpException(
          409,
          `User with email ${model.email} is not verified`
        );
      }
    }

    if (!user) {
      throw new HttpException(409, `User with email ${model.email} is not verified`)
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(model.password!, salt);


    const createdUser = await this.userSchema.findByIdAndUpdate(user._id , {
      ...model,
      password: hashedPassword,
    }, {new: true, runValidators: true});

    if(!createdUser){
      throw new HttpException(409, 'You are not an user');
    }

    const url='http://localhost:5173/'
    // const url=`${req.protocol}://${req.get('host')}`
    await new Email(createdUser, url).sendWelcome();

    return createdUser;
  }


  public async updateUser(userId: string, model: UpdateUserDto): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findById(userId).exec();
  
    if (!user) {
      throw new HttpException(
        400,
        `User id is not exists`
      );
    }

    const checkPhoneExist = await this.userSchema.find({
      $and:[{phone: {$eq:model.phone}}, {_id: userId}]
    }).exec()

    if(checkPhoneExist.length !== 0){
        throw new HttpException(StatusCodes.BAD_REQUEST, 'Phone is used by another user')
    }

    const updateUserById = await this.userSchema.findByIdAndUpdate(userId, {
      ...model
    }, 
    {new: true, runValidators: true}
    ).exec();

    if(!updateUserById){
      throw new HttpException(409, 'You are not an user');
    }

    return updateUserById;

  }

  public async getUserById(userId: string) : Promise<IUser> {
    const user = await this.userSchema.findById(userId).select('-__v').exec();
    if(!user){
        throw new HttpException(404, `User is not exits`)
    }
    return user;
  } 

  public async getAllUsers() : Promise<IUser[]> {
    const users = await this.userSchema.find().select('-__v').exec();
    return users
  }

  public async deleteUser(userId: string) : Promise<void> {
    await this.userSchema.findByIdAndUpdate(userId, {active: false})
  }

  public async changePassword(userId: string, model: ChangePasswordDto, req: Request, res: Response) : Promise<void> {
    const {currentPassword, newPassword} = model;
    const user = await this.userSchema.findById(userId).select('+password +refreshToken').exec();
    if(!user){
        throw new HttpException(404, `User is not exits`)
    }

    const isMatchPassword = await bcrypt.compare(currentPassword, user.password);
    if(!isMatchPassword){
        throw new HttpException(400, 'Old password is not correct')
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userSchema.findByIdAndUpdate(userId, {password: hashedPassword})

    const cookies = req.cookies;
    const accessToken = signToken(user._id, process.env.JWT_TOKEN_SECRET! ,process.env.JWT_EXPIRES_IN!);
    const newRefreshToken = signToken(user._id, process.env.REFRESH_TOKEN_SECRET! , process.env.REFRESH_EXPIRES_IN!);
     // Changed to let keyword
    
    let newRefreshTokenArray =
      !cookies?.jwt
          ? user.refreshToken
          : user.refreshToken.filter(rt => rt !== cookies.jwt) || [];

    if (cookies?.jwt) {
        /* 
            - User logs in but never uses RT and does not logout 
            - RT is stolen
            - If 1 & 2, reuse detection is needed to clear all RTs when user logs in
        */
        const refreshToken = cookies.jwt;
        const foundToken = await this.userSchema.findOne({ refreshToken }).exec();

        // Detected refresh token reuse!
        if (!foundToken) {
            // clear out ALL previous refresh tokens
            newRefreshTokenArray = [];
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    }

    // Saving refreshToken with current user
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();
   
    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.status(200).json({data: accessToken, message: "Update password successfully"});
  }
  public async uploadAvatar(userId: string, avatar: string) : Promise<IUser> {
      const updatedUser = await this.userSchema.findByIdAndUpdate(userId, {avatar: avatar}, {new: true}).exec();
      if(!updatedUser){
          throw new HttpException(404, `User is not exits`)
      }
      return updatedUser;
  }
}

export default UserService;
