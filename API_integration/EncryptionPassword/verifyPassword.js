import bcrypt from 'bcrypt'
const verifyPassword=async(password, hashedPassword)=> {
    try {
      const match = await bcrypt.compare(password, hashedPassword);
      return match;
    } catch (error) {
      throw error;
    }
  }

export default verifyPassword