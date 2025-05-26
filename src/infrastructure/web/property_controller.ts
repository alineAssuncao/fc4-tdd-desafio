import { Request, Response } from "express";
import { PropertyService } from "../../application/services/property_service";

export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  async createProperty(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, maxGuests, basePricePerNight } = req.body;
      const property = await this.propertyService.createProperty(
        name,
        description,
        maxGuests,
        basePricePerNight
      );
      return res.status(201).json(property);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async findPropertyById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const property = await this.propertyService.findPropertyById(id);

      if (!property) {
        return res.status(404).json({ error: "Propriedade não encontrada." });
      }

      return res.status(200).json(property);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}