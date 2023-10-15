import { DataStoredInToken, TokenData } from "@modules/auth";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser, UserSchema } from "@modules/users";
import AuthDto from "./auth.dto";

class AuthService {
  public userSchema = UserSchema;

  public async login(model: AuthDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email }).exec();


   
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

    return this.createToken(user);
  }

  public async getCurrentLoginUser(userId: string) : Promise<IUser> {
    const currentUser = await this.userSchema.findById(userId).exec()
    if (!currentUser) {
      throw new HttpException(400, "User not found")
    }
    return currentUser
  } 

  

  private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = { id: user._id }
    const secretKey: string = process.env.JWT_TOKEN_SECRET!
    return {
      token: jwt.sign(dataInToken, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN }),
    };
  }
}

export default AuthService;
