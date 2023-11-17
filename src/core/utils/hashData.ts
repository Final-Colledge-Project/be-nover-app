import bcrypt from 'bcrypt';

export const hashData = async (data: string, saltRounds: number = 10) => {
  try {
    const hashedData = await bcrypt.hash(data, saltRounds)
    return hashedData
  } catch (error) {
    throw error
  }
}

export const compareHash = async (data: string, hashedData: string) => {
  try {
    const isMatch = await bcrypt.compare(data, hashedData)
    return isMatch
  } catch (error) {
    throw error
  }
}
