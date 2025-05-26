import { PropertyMapper } from "./property_mapper";
import { Property } from "../../../domain/entities/property";
import { PropertyEntity } from "../entities/property_entity";

describe("PropertyMapper", () => {
    
    it("deve converter PropertyEntity para Property corretamente", () => {
        const entity: PropertyEntity = {
            id: "1",
            name: "Apartamento Luxo",
            description: "Apartamento de luxo no centro da cidade",
            maxGuests: 4,
            basePricePerNight: 250,
            bookings: [], 
        };

        const property = PropertyMapper.toDomain(entity);

        expect(property.getId()).toBe("1");
        expect(property.getName()).toBe("Apartamento Luxo");
        expect(property.getDescription()).toBe("Apartamento de luxo no centro da cidade");
        expect(property.getMaxGuests()).toBe(4);
        expect(property.getBasePricePerNight()).toBe(250);
    });

    it("deve converter Property para PropertyEntity corretamente", () => {
        const property = new Property("1", "Apartamento Luxo", "Apartamento de luxo no centro da cidade", 4, 250);

        const entity = PropertyMapper.toPersistence(property);

        expect(entity.id).toBe("1");
        expect(entity.name).toBe("Apartamento Luxo");
        expect(entity.description).toBe("Apartamento de luxo no centro da cidade");
        expect(entity.maxGuests).toBe(4);
        expect(entity.basePricePerNight).toBe(250);
    });

    it("deve lançar erro de validação ao faltar campos obrigatórios no PropertyEntity", () => {
        const entitySemId = {
            name: "Apartamento Luxo",
            description: "Apartamento de luxo no centro da cidade",
            maxGuests: 4,
            basePricePerNight: 250,
        } as PropertyEntity;

        const entitySemNome = {
            id: "1",
            description: "Apartamento de luxo no centro da cidade",
            maxGuests: 4,
            basePricePerNight: 250,
        } as PropertyEntity;

        const entitySemMaxGuests = {
            id: "1",
            name: "Apartamento Luxo",
            description: "Apartamento de luxo no centro da cidade",
            basePricePerNight: 250,
        } as PropertyEntity;

        expect(() => PropertyMapper.toDomain(entitySemId)).toThrowError("O ID da propriedade é obrigatório.");
        expect(() => PropertyMapper.toDomain(entitySemNome)).toThrowError("O nome da propriedade é obrigatório.");
        expect(() => PropertyMapper.toDomain(entitySemMaxGuests)).toThrowError("O número máximo de hóspedes é obrigatório.");
    });

});