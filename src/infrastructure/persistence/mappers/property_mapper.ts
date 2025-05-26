import { Property } from "../../../domain/entities/property";
import { PropertyEntity } from "../entities/property_entity";

export class PropertyMapper {
  static toDomain(entity: PropertyEntity): Property {
    
    if (!entity) throw new Error("A entidade PropertyEntity não pode ser nula.");
    if (!entity.id) throw new Error("O ID da propriedade é obrigatório.");
    if (!entity.name) throw new Error("O nome da propriedade é obrigatório.");
    if (!entity.maxGuests) throw new Error("O número máximo de hóspedes é obrigatório.");

    return new Property(
      entity.id,
      entity.name,
      entity.description,
      entity.maxGuests,
      Number(entity.basePricePerNight)
    );
  }

  static toPersistence(domain: Property): PropertyEntity {
    const entity = new PropertyEntity();
    entity.id = domain.getId();
    entity.name = domain.getName();
    entity.description = domain.getDescription();
    entity.maxGuests = domain.getMaxGuests();
    entity.basePricePerNight = domain.getBasePricePerNight();
    return entity;
  }
}
