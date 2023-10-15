import nodemailer from 'nodemailer'
import Logger from './logger'

let transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  auth: {
    user: process.env.AUTH_USERNAME,
    pass: process.env.AUTH_PASSWORD
  }
})

//test transporter
transporter.verify((error, success) => {
  if(error) {
    Logger.error(error)
  }
  else {
    Logger.info('Ready to send email')
  }
})


const sendEmail = async (mailOptions : object) => {
  try{
    await transporter.sendMail(mailOptions)
    return
  }
  catch(err){
    throw err
  }
}

export default sendEmail
