import { Request, Response } from "express";
import { UserService } from "../../application/services/user_service";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<Response> {
    
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "O campo nome é obrigatório e deve ser uma string válida." });
      }

      const user = await this.userService.createUser(name);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async findUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await this.userService.findUserById(id);

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro interno do servidor." });
    }
  }
}