import { UserMapper } from "./user_mapper";
import { User } from "../../../domain/entities/user";
import { UserEntity } from "../entities/user_entity";

describe("UserMapper", () => {
    
    it("deve converter UserEntity para User corretamente", () => {
        const entity: UserEntity = {
            id: "1",
            name: "João Manuel",
        };

        const user = UserMapper.toDomain(entity);

        expect(user.getId()).toBe("1");
        expect(user.getName()).toBe("João Manuel");
    });

    it("deve converter User para UserEntity corretamente", () => {
        const user = new User("1", "João Manuel");

        const entity = UserMapper.toPersistence(user);

        expect(entity.id).toBe("1");
        expect(entity.name).toBe("João Manuel");
    });

    it("deve lançar erro de validação ao faltar campos obrigatórios no UserEntity", () => {
        const entitySemId = { name: "João Manuel" } as UserEntity;
        const entitySemNome = { id: "1" } as UserEntity;

        expect(() => UserMapper.toDomain(entitySemId)).toThrowError("O ID do usuário é obrigatório.");
        expect(() => UserMapper.toDomain(entitySemNome)).toThrowError("O nome do usuário é obrigatório.");
    });

});