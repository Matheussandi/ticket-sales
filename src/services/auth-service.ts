import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../model/user-model.ts";

export class AuthService {
  async login(email: string, password: string) {
    const userModel = await UserModel.findByEmail(email);

    if (userModel && bcrypt.compareSync(password, userModel.password || "")) {
      const token = jwt.sign(
        { id: userModel.id, email: userModel.email },
        "your_secret_key",
        { expiresIn: "1h" }
      );

      return { token };
    } else {
      throw new InvalidCredentialsError();
    }

  }
}

export class InvalidCredentialsError extends Error {}
