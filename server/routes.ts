import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Object Storage routes (handles /api/uploads/request-url and /objects/:path)
  registerObjectStorageRoutes(app);

  // Clients
  app.get(api.clients.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const clients = await storage.getClients(search);
    res.json(clients);
  });

  app.get(api.clients.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const documents = await storage.getDocumentsByClient(id);
    res.json({ ...client, documents });
  });

  app.post(api.clients.create.path, async (req, res) => {
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.clients.update.input.parse(req.body);
      const updated = await storage.updateClient(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.clients.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    await storage.deleteClient(id);
    res.status(204).send();
  });

  // Documents
  app.get(api.documents.listByClient.path, async (req, res) => {
    const clientId = Number(req.params.clientId);
    const docs = await storage.getDocumentsByClient(clientId);
    res.json(docs);
  });

  app.post(api.documents.create.path, async (req, res) => {
    try {
      const input = api.documents.create.input.parse(req.body);
      const doc = await storage.createDocument(input);
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.documents.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const doc = await storage.getDocument(id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Note: In a real app we might also delete from Object Storage here,
    // but the integration blueprint doesn't expose a direct delete method easily
    // without using the client. For now, we just delete the metadata.
    
    await storage.deleteDocument(id);
    res.status(204).send();
  });

  // Seed Data
  if ((await storage.getClients()).length === 0) {
    console.log("Seeding database...");
    const c1 = await storage.createClient({
      name: "João Silva",
      cpf: "123.456.789-00",
      email: "joao@example.com",
      phone: "(11) 99999-9999",
      notes: "Cliente preferencial.",
    });
    const c2 = await storage.createClient({
      name: "Maria Oliveira",
      cpf: "987.654.321-11",
      email: "maria@example.com",
      phone: "(21) 88888-8888",
      notes: "Interessada em novos produtos.",
    });

    // Seed some documents? Requires valid storage keys which we don't have easily.
    // Skip seeding documents to avoid broken links.
  }

  return httpServer;
}
