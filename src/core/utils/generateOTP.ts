const generateOTP = async () => {
  try {
    return `${Math.floor(Math.random() * 900000) + 100000}`
  }
  catch(err){
    throw err
  }
}

export default generateOTP