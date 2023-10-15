import { HttpException } from "@core/exceptions";
import OTPSchema from "./otp.model";
import { compareHash, generateOTP, hashData, sendEmail } from "@core/utils";
import SendOtpDto from "./dtos/sendOtp.dto";
import IOtp from "./otp.interface";
import VerifyOtpDto from "./dtos/verifyOtp.dto";
import { UserSchema } from "@modules/users";

class OTPService {
  public otpSchema = OTPSchema;
  public userSchema = UserSchema;

  public async sendOTP(model: SendOtpDto): Promise<IOtp> {
      const { email, subject, message, duration = 1 } = model;
      if (!(email && subject && message)) {
        throw new HttpException(
          400,
          "Provide values for email, subject and message"
        );
      }
      //clear and old record
      await OTPSchema.deleteOne({ email });
      
      //generate new otp
      const generatedOTP = await generateOTP();

      //send email
      const mailOptions = {
        from: process.env.AUTH_USERNAME,
        to: email,
        subject,
        html: `<p>${message}</p>
               <p style="color:#007AFF;font-size:25px;letter-spacing:2px"><b>${generatedOTP}</b></p>
               <p>This code <b>expires in ${duration} hour(s)</b></p>`,
      };

      await sendEmail(mailOptions);

      //save otp record
      const hashedOTP = await hashData(generatedOTP);
      const newOtp = await new OTPSchema({
        email,
        otp: hashedOTP,
        createdAt: Date.now(),
        expireAt: Date.now() + 3600000 * duration,
      });

      const createdOtp = await newOtp.save();
      return createdOtp;
  }

  public async verifyOTP(model: VerifyOtpDto): Promise<boolean> {

    let { email, otp } = model
     if (!(email && otp)){
       throw new HttpException(400, "Provide values for email and otp")
     }

     //ensure otp record exists
     const matchedOtpRecord =  await OTPSchema.findOne({email})

     if (!matchedOtpRecord) {
      throw new HttpException(400, "OTP record not found")
     }

     const {expireAt} = matchedOtpRecord

     //check if otp has expired
     

     if (expireAt.getTime() < Date.now().valueOf()){
      await OTPSchema.deleteOne({email}) 
      throw new HttpException(400, "OTP has expired. Request for new one")
     }

     //not expired, verify value
     const hashedOTP = matchedOtpRecord.otp
     const validOTP = await compareHash(otp, hashedOTP)
     return validOTP
  }

  public async deleteOTP(email: string) : Promise<void> {
    try{
      await OTPSchema.deleteOne({email})
    }
    catch(err){
      throw err
    }
  }

  public async sendRegisterOtp(model: SendOtpDto) : Promise<IOtp> {
    const {email} = model
    const existingUser = await UserSchema.findOne({email: email})


    if (existingUser) {
      throw new HttpException(401, "Email already exists")
    }

    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Your OTP for email verification is",
      duration: 1
    }

    const createdOtp = await this.sendOTP(otpDetails)
    return createdOtp
  }

  public async verifyEmailOtp(model: VerifyOtpDto) : Promise<void> {
    const {email, otp} = model

    const validOTP = await this.verifyOTP({email, otp})

    if (!validOTP) {
      throw new HttpException(400, "Invalid code passed. Check your inbox")
    }

    await this.deleteOTP(email)
  }
}

export default OTPService;
