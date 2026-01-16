import { Database } from "../database.ts";
import { UserModel } from "../model/user-model.ts";
import { PartnerModel } from "../model/partner-model.ts";

export class PartnerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }) {
    const { name, email, password, company_name } = data;

    const connection = Database.getInstance();

    try {
      await connection.beginTransaction();

      const user = await UserModel.create({
        name,
        email,
        password,
      });

      const partner = await PartnerModel.create({
        user_id: user.id,
        company_name,
      });

      await connection.commit();

      return {
        id: partner.id,
        name,
        user_id: user.id,
        company_name,
        created_at: partner.created_at,
      };
    } catch (error) {
      await connection.rollback();
      throw new Error("Registration failed: " + (error as Error).message);
    }
  }

  async findByUserId(userId: number) {
    return PartnerModel.findByUserId(userId);
  }
}
