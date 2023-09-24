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

    const user = await this.userSchema.findOne({ email: model.email });

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

  private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = { id: user._id };
    const secretKey: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 60; // 24 hours
    return {
      token: jwt.sign(dataInToken, secretKey, { expiresIn }),
    };
  }
}

export default UserService;
