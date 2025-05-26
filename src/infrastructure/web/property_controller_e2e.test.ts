import request from "supertest";
import express from "express";
import { PropertyService } from "../../application/services/property_service";
import { PropertyController } from "./property_controller";
import { TypeORMPropertyRepository } from "../repositories/typeorm_property_repository"; // Ajuste conforme sua estrutura
import { PropertyEntity } from "../persistence/entities/property_entity";
import { DataSource } from "typeorm";
import { BookingEntity } from "../persistence/entities/booking_entity";
import { UserEntity } from "../persistence/entities/user_entity";

const app = express();
app.use(express.json());

describe("PropertyController - End-to-End", () => {  
  let dataSource: DataSource;
  let propertyRepository: TypeORMPropertyRepository;
  let propertyService: PropertyService;
  let propertyController: PropertyController;  

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [PropertyEntity, BookingEntity, UserEntity],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();

    propertyRepository = new TypeORMPropertyRepository(dataSource.getRepository(PropertyEntity));
    propertyService = new PropertyService(propertyRepository);
    propertyController = new PropertyController(propertyService);

    app.post("/properties", async (req, res) => {
        await propertyController.createProperty(req, res);
    });

    app.get("/properties/:id", async (req, res) => {
        await propertyController.findPropertyById(req, res);
    });

  });

  afterAll(async () => {
    await dataSource.destroy();
  });  

  it("deve criar uma propriedade com sucesso", async () => {
    const response = await request(app)
      .post("/properties")
      .send({ 
        name: "Casa de Praia",
        description: "Uma casa à beira-mar perfeita para relaxar.",
        maxGuests: 4,
        basePricePerNight: 250
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Casa de Praia");
    expect(response.body.description).toBe("Uma casa à beira-mar perfeita para relaxar.");
    expect(response.body.maxGuests).toBe(4);
    expect(response.body.basePricePerNight).toBe(250);
  });

  it("deve retornar erro com código 400 ao tentar criar propriedade sem nome", async () => {
    const response = await request(app).post("/properties").send({ 
      name: "", 
      description: "Casa grande",
      maxGuests: 4,
      basePricePerNight: 200
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O nome da propriedade é obrigatório.");
  });

  it("deve retornar erro com código 400 ao tentar criar propriedade sem descrição", async () => {
    const response = await request(app).post("/properties").send({ 
      name: "Casa Rural",
      description: "",
      maxGuests: 4,
      basePricePerNight: 200
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("A descrição da propriedade é obrigatória.");
  });

  it("deve retornar erro com código 400 ao tentar criar propriedade com número de hóspedes inválido", async () => {
    const response = await request(app).post("/properties").send({ 
      name: "Casa na Montanha",
      description: "Um chalé aconchegante no topo da montanha.",
      maxGuests: 0,
      basePricePerNight: 300
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O número máximo de hóspedes deve ser maior que zero.");
  });

  it("deve retornar erro com código 400 ao tentar criar propriedade com preço por noite inválido", async () => {
    const response = await request(app).post("/properties").send({ 
      name: "Apartamento Executivo",
      description: "Ótima localização para negócios e turismo.",
      maxGuests: 2,
      basePricePerNight: -100
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O preço por noite deve ser maior que zero.");
  });

  it("deve buscar uma propriedade por ID com sucesso", async () => {
    const createResponse = await request(app)
      .post("/properties")
      .send({ 
        name: "Cabana Florestal",
        description: "Lugar perfeito para quem gosta de contato com a natureza.",
        maxGuests: 6,
        basePricePerNight: 180
      });

    const propertyId = createResponse.body.id;

    const getResponse = await request(app).get(`/properties/${propertyId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(propertyId);
    expect(getResponse.body.name).toBe("Cabana Florestal");
    expect(getResponse.body.description).toBe("Lugar perfeito para quem gosta de contato com a natureza.");
  });

  it("deve retornar erro 404 ao buscar uma propriedade inexistente", async () => {
    const response = await request(app).get("/properties/non-existent-id");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Propriedade não encontrada.");
  });
});

