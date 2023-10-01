import nodemailer from 'nodemailer'

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
    console.log(error)
  }
  else {
    console.log('Ready to send email')
    console.log(success)
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
