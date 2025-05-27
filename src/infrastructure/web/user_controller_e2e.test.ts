import request from "supertest";
import express from "express";
import { TypeORMUserRepository } from "../repositories/typeorm_user_repository";
import { UserService } from "../../application/services/user_service";
import { UserEntity } from "../persistence/entities/user_entity";
import { UserController } from "./user_controller";
import { DataSource } from "typeorm";
const app = express();
app.use(express.json());

describe("UserController", () => {  
  let dataSource: DataSource;
  let userRepository: TypeORMUserRepository;
  let userService: UserService;  
  let userController: UserController;  

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [UserEntity],
      synchronize: true,
      logging: false,
    });
  
    await dataSource.initialize();

    userRepository = new TypeORMUserRepository(dataSource.getRepository(UserEntity));
    userService = new UserService(userRepository);
    userController = new UserController(userService);

    app.post("/users", async (req, res) => {
      await userController.createUser(req, res);
    });

  });

  afterAll(async () => {
    await dataSource.destroy();
  }); 

  it("deve criar um usuário com sucesso", async () => {
    const response = await request(app)
      .post("/users")
      .send({ name: "João Manuel" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("João Manuel");
  });

  it("deve retornar erro com código 400 e mensagem 'O campo nome é obrigatório.' ao enviar um nome vazio", async () => {
    const response = await request(app).post("/users").send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O campo nome é obrigatório e deve ser uma string válida.");
  });

  it("deve retornar erro 400 ao tentar criar usuário sem nome", async () => {
    const response = await request(app).post("/users").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O campo nome é obrigatório e deve ser uma string válida.");
  });

  it("deve retornar erro 400 ao tentar criar usuário com nome não-string", async () => {
    const response = await request(app).post("/users").send({ name: 123 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O campo nome é obrigatório e deve ser uma string válida.");
  });

});

