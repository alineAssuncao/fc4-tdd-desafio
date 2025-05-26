import { User } from "../../../domain/entities/user";
import { UserEntity } from "../entities/user_entity";

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    
    if (!entity) throw new Error("A entidade UserEntity não pode ser nula.");
    if (!entity.id) throw new Error("O ID do usuário é obrigatório.");
    if (!entity.name) throw new Error("O nome do usuário é obrigatório.");

    return new User(entity.id, entity.name);
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.getId();
    entity.name = domain.getName();
    return entity;
  }
}
