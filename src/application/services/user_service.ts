import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/user_repository";
import { v4 as uuidv4 } from "uuid";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(name: string): Promise<User> {
    if (!name || name.trim().length === 0) {
      throw new Error("O campo nome é obrigatório.");
    }

    const user = new User(uuidv4(), name);
    await this.userRepository.save(user);
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
