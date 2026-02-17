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

    const connection = await Database.getInstance().getConnection();

    try {
      await connection.beginTransaction();

      const user = await UserModel.create(
        {
          name,
          email,
          password,
          role: 'customer',
        },
        { connection },
      );

      const customer = await CustomerModel.create(
        {
          user_id: user.id,
          address,
          phone,
        },
        { connection },
      );

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
    } finally {
      connection.release();
    }
  }

  async findByUserId(userId: number) {
    const customer = await CustomerModel.findByUserId(userId);
    return customer;
  }
}
