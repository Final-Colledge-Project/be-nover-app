import { HttpException } from '@core/exceptions'
import OTPSchema from './otp.model'
import { generateOTP, sendEmail } from '@core/utils'
import VerifyDto from './dtos/verify.dto'
import bcrypt from "bcrypt"
import IOtp from './otp.interface'

class OTPService {
  public otpSchema = OTPSchema

  public async sendOTP(model: VerifyDto) : Promise<IOtp> {
    const {email, subject, message, duration = 1} = model

    try {
      if(!(email && subject && message)) {
        throw new HttpException(400, 'Provide values for email, subject and message')
      }

      //clear and old record
      await OTPSchema.deleteOne({email})

      //generate new otp
      const generatedOTP = await generateOTP()

      //send email
      const mailOptions = {
        from: process.env.AUTH_USERNAME,
        to: email,
        subject,
        html: `<p>${message}</p>
               <p style="color:tomato;font-size:25px;letter-spacing:2px"><b>${generatedOTP}</b></p>
               <p>This code <b>expires in ${duration} hour(s)</b></p>`
      }

      await sendEmail(mailOptions)

      //save otp record
      const salt = await bcrypt.genSalt(10)
      const hashedOTP = await bcrypt.hash(generatedOTP, salt)
      const newOtp = await new OTPSchema({
        email,
        otp: hashedOTP,
        createdAt: Date.now(),
        expireAt: Date.now() + 3600000 * duration
      })

      const createdOtp = await newOtp.save()
      return createdOtp
    }
    catch (error) {
      throw error
    }
  }
}

export default OTPService