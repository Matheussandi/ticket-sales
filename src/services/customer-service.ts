import bcrypt from "bcrypt";
import { Database } from "../database.ts";
import { UserModel } from "../model/user-model.ts";
import { CustomerModel } from "../model/customer-model.ts";

export class CustomerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
  }) {
    const { name, email, password, address, phone } = data;

    const connection = Database.getInstance();

    try {
      await connection.beginTransaction();

      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
      });


      const customer = await CustomerModel.create({
        user_id: user.id,
        address,
        phone,
      });

      await connection.commit();

      return {
        id: customer.id,
        name,
        user_id: user.id,
        address,
        phone,
        created_at: customer.created_at,
      };
    } catch (error) {
      await connection.rollback();
      throw new Error("Registration failed: " + (error as Error).message);
    }
  }
}
