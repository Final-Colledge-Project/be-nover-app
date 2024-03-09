import { UserSchema } from "@modules/users";
import SendEmailDto from "./dtos/sendEmailDto";
import { HttpException } from "@core/exceptions";
import { IOtp, OTPService } from "@modules/otp";
import VerifyEmailDto from "./dtos/verifyEmailDto";
import EmailVerifySchema from "./emailVerify.model";
import { StatusCodes } from "http-status-codes";
class EmailVerificationService {
  public userSchema = UserSchema;
  public otpService = new OTPService();

  public async sendEmailOTP(model: SendEmailDto): Promise<IOtp> {
    const { email } = model;
    const existingEmailVerify = await EmailVerifySchema.findOne({ email });

    if (!existingEmailVerify) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "There are no account for the provided email"
      );
    }

    if (existingEmailVerify.isVerified === true) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Email is already verified. Please login"
      );
    }

    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Your OTP for email verification is",
      duration: 2,
    };

    const createdOtp = await this.otpService.sendOTP(otpDetails);
    return createdOtp;
  }

  public async verifyEmailOTP(model: VerifyEmailDto): Promise<void> {
    const { email, otp } = model;
    const validOTP = await this.otpService.verifyOTP({ email, otp });

    if (!validOTP) {
      throw new HttpException(400, "Invalid code passed. Check your inbox");
    }

    const emailVerify = new EmailVerifySchema({ email, verify: true });
    await emailVerify.save();

    await this.otpService.deleteOTP(email);
  }
}

export default EmailVerificationService;
