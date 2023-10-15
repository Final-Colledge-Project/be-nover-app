import { DataStoredInToken, TokenData } from "@modules/auth";
import RegisterDto from "./dtos/register.dto";
import UserSchema from "./user.model";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import bcrypt from "bcrypt";
import IUser from "./user.interface";
import jwt from "jsonwebtoken";

class UserService {
  public userSchema = UserSchema;

  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email }).exec();

    if (user) {
      throw new HttpException(
        409,
        `User with email ${model.email} already exists`
      );
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(model.password!, salt);

    const createdUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
    });

    return this.createToken(createdUser);
  }


  public async updateUser(userId: string, model: RegisterDto): Promise<IUser> {
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

    if(user.email !== model.email) {
      throw new HttpException(400, 'You are not allowed to change email')
    }
    
    const checkPhoneExist = await this.userSchema.find({
      $and:[{phone: {$eq:model.phone}}, {_id: {$ne: userId}}]
    }).exec()


    if(checkPhoneExist.length !== 0){
        throw new HttpException(400, 'Phone is used by another user')
    }

    const updateUserById = await this.userSchema.findByIdAndUpdate(userId, {
      ...model,
    }, 
    {new: true, runValidators: true}
    ).exec();

    if(!updateUserById){
      throw new HttpException(409, 'You are not an user');
    }

    return updateUserById;

  }

  public async getUserById(userId: string) : Promise<IUser> {
    const user = await this.userSchema.findById(userId).exec();
    if(!user){
        throw new HttpException(404, `User is not exits`)
    }
    return user;
  } 

  public async getAllUsers() : Promise<IUser[]> {
    const users = await this.userSchema.find().exec();
    return users
  }

  private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = { id: user._id }
    const secretKey: string = process.env.JWT_TOKEN_SECRET!
    return {
      token: jwt.sign(dataInToken, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN }),
    };
  }
}

export default UserService;
