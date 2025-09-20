import bcrypt from 'bcrypt';

class BcryptHashService {
  public static async hash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(12);
    return bcrypt.hash(password, saltRounds);
  }

  public static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default BcryptHashService;
