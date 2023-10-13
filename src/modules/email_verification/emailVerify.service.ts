import { UserSchema } from "@modules/users";
import SendEmailDto from "./dtos/sendEmailDto";
import { HttpException } from "@core/exceptions";
import { IOtp, OTPService } from "@modules/otp";
import VerifyEmailDto from "./dtos/verifyEmailDto";


class EmailVerificationService {
  public userSchema = UserSchema;
  public otpService = new OTPService();

  public async sendEmailOTP(model: SendEmailDto) : Promise<IOtp>{
      const {email} = model
      const existingUser = await UserSchema.findOne({email})

      if (!existingUser) {
        throw new HttpException(400, "There are no account for the provided email")
      }

      const otpDetails = {
        email,
        subject: "Email Verification",
        message: "Your OTP for email verification is",
        duration: 1
      }

      const createdOtp = await this.otpService.sendOTP(otpDetails)
      return createdOtp
  }


  public async verifyEmailOTP (model: VerifyEmailDto) : Promise<void>{
      const {email, otp} = model
      const validOTP = await this.otpService.verifyOTP({email, otp})

      if (!validOTP) {
        throw new HttpException(400, "Invalid code passed. Check your inbox")

      }
      
      await this.otpService.deleteOTP(email)
  }
}

export default EmailVerificationService;
