import { DataStoredInToken, TokenData } from "@modules/auth";
import { Logger, hashData, isEmptyObject, signToken } from "@core/utils";
import { HttpException } from "@core/exceptions";
import bcrypt from "bcrypt";
import jwt, { VerifyErrors, VerifyOptions } from "jsonwebtoken";
import { IUser, UserSchema } from "@modules/users";
import AuthDto from "./auth.dto";
import { OTPService } from "@modules/otp";
import ResetDto from "./dtos/reset.dto";
import { Decoded, jwtVerifyPromisified } from "@core/middleware/auth.middleware";
import { Http } from "winston/lib/winston/transports";
import { Response, Request } from "express";
class AuthService {
  public userSchema = UserSchema;
  public otpService = new OTPService(); 
  
  public async handleLogin(model: AuthDto, req: Request, res: Response): Promise<void> {
    
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email }).select('+password +refreshToken').exec();

    if (!user) {
      throw new HttpException(
        409,
        `User with email ${model.email} is not exits`
      );
    }

    const isMatchPassword = await bcrypt.compare(
      model.password!,
      user.password
    );
    if (!isMatchPassword) {
      throw new HttpException(400, "Credential is not valid");
    }

    const cookies = req.cookies;

    const accessToken = signToken(user._id, process.env.JWT_TOKEN_SECRET! ,process.env.JWT_EXPIRES_IN!);
    const newRefreshToken = signToken(user._id, process.env.REFRESH_TOKEN_SECRET! , process.env.REFRESH_EXPIRES_IN!);
     // Changed to let keyword
    
    let newRefreshTokenArray =
      !cookies?.jwt
          ? user.refreshToken
          : user.refreshToken.filter(rt => rt !== cookies.jwt) || [];
    
    console.log('User refresh tokens: ', user.refreshToken);

    if (cookies?.jwt) {
        /* 
        Scenario added here: 
            1) User logs in but never uses RT and does not logout 
            2) RT is stolen
            3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
        */
        const refreshToken = cookies.jwt;
        const foundToken = await this.userSchema.findOne({ refreshToken }).exec();

        // Detected refresh token reuse!
        if (!foundToken) {
            console.log('attempted refresh token reuse at login!')
            // clear out ALL previous refresh tokens
            newRefreshTokenArray = [];
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    }

    // Saving refreshToken with current user
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await user.save();
    console.log(result);
   

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.status(200).json({data: accessToken, message: "Login success"});

  }

  
  public async getCurrentLoginUser(userId: string) : Promise<IUser> {
    const currentUser = await this.userSchema.findById(userId).select('-__v').exec()
    if (!currentUser) {
      throw new HttpException(400, "User not found")
    }
    return currentUser
  } 

  public async forgotPassword(email: string) {
    //1. Get user based on POSTed email
    const user = await this.userSchema.findOne({ email }).exec();

    if(!user) {
      throw new HttpException(404, 'There is no user with email address.')
    }

    //2. Gene
    const otpDetails = {
      email,
      subject: "Password Reset",
      message: "Enter the code below to reset your password",
      duration: 10
    }

    const forgotOtp = await this.otpService.sendOTP(otpDetails)
    return forgotOtp
  }

  public async resetPassword(model: ResetDto, req: Request, res: Response) : Promise<void> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const {email, otp, newPassword} = model
    const validOTP = await this.otpService.verifyOTP({email, otp})

    if (!validOTP) {
      throw new HttpException(400, "Invalid code passed. Check your inbox")
    }

    //Update password
    const hastNewPassword = await hashData(newPassword)

    const newUser = await this.userSchema.findOne({ email: model.email }).select('+password +refreshToken').exec();

    if (!newUser) {
      throw new HttpException(
        409,
        `User with email ${model.email} is not exits`
      );
    }

    newUser.password = hastNewPassword
    newUser.save()
    
    await this.otpService.deleteOTP(email)
    
    const cookies = req.cookies;
    const accessToken = signToken(newUser._id, process.env.JWT_TOKEN_SECRET! ,process.env.JWT_EXPIRES_IN!);
    const newRefreshToken = signToken(newUser._id, process.env.REFRESH_TOKEN_SECRET! , process.env.REFRESH_EXPIRES_IN!);
     // Changed to let keyword
    
    let newRefreshTokenArray =
      !cookies?.jwt
          ? newUser.refreshToken
          : newUser.refreshToken.filter(rt => rt !== cookies.jwt) || [];
    
    console.log('User refresh tokens: ', newUser.refreshToken);

    if (cookies?.jwt) {
        /* 
        Scenario added here: 
            1) User logs in but never uses RT and does not logout 
            2) RT is stolen
            3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
        */
        const refreshToken = cookies.jwt;
        const foundToken = await this.userSchema.findOne({ refreshToken }).exec();

        // Detected refresh token reuse!
        if (!foundToken) {
            console.log('attempted refresh token reuse at login!')
            // clear out ALL previous refresh tokens
            newRefreshTokenArray = [];
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    }

    // Saving refreshToken with current user
    newUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await newUser.save();
    console.log(result);
   
    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.status(200).json({data: accessToken, message: "Reset password successfully"});
    
  }

  public async handleRefreshToken (refreshToken: string) : Promise<TokenData> {
   
    const foundUser  = await this.userSchema.findOne({ refreshToken }).select('+refreshToken').exec();

    let tokenData : TokenData = {accessToken: '', refreshToken: ''}

    if (!foundUser) {
      try {
        const decoded : Decoded= await jwtVerifyPromisified(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!) as Decoded;

          const hackedUser = await this.userSchema.findById(decoded?.userId).exec();
          if(!hackedUser) throw new HttpException(403, 'hacked user not found');
          hackedUser.refreshToken = [];
          const result = await hackedUser.save();
          console.log(result);
      }
      catch(err) {
        throw new HttpException(403, 'Forbidden');
      }
      
      throw new HttpException(403, 'Forbidden'); //Forbidden
  }

    const newRefreshTokenArray = foundUser?.refreshToken.filter(rt => rt !== refreshToken);

    // evaluate jwt 
    try {
      const decoded : Decoded= await jwtVerifyPromisified(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!) as Decoded;
      
      if (foundUser._id.toString() !== decoded.userId) {
        throw new HttpException(403, 'Invalid refresh token')
      };
      const accessToken = signToken(decoded?.userId, process.env.JWT_TOKEN_SECRET!, process.env.JWT_EXPIRES_IN!);
      const newRefreshToken = signToken(foundUser._id.toString(), process.env.REFRESH_TOKEN_SECRET!, process.env.REFRESH_EXPIRES_IN!);
      
      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await foundUser.save();
      console.log(result);
      tokenData = {accessToken, refreshToken: newRefreshToken}
    }
    catch(err){
      foundUser.refreshToken = [...newRefreshTokenArray];
      await foundUser.save();
      throw new HttpException(403, 'Invalid refresh token');
    }
    return tokenData;
  }

  public async handleLogout(req: Request, res: Response) : Promise<void> {
    const cookies = req.cookies;

    if (!cookies?.jwt) throw new HttpException(204, 'Refresh token not found'); //No content
    
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await this.userSchema.findOne({ refreshToken }).select('+refreshToken').exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
        throw new HttpException(204, 'User not found'); //No content
    }

    // Delete refreshToken in db
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);;
    const result = await foundUser.save();
    console.log(result);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.status(201).json({message: 'Logout success'});
  }
  
}

export default AuthService;
