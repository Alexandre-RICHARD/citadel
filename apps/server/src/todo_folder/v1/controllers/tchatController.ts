import type { Request, Response } from "express";

import { SocketService } from "../socketIo.ts";
import type { SendMessageEndPointBody } from "../types/endpointBody/tchat/sendMessage.endpointBody.type.ts";

const messages: string[] = [];

export const tchatController = {
  getMessages: async (_req: Request, res: Response) => {
    res.json({ messages });
  },

  sendMessage: async (req: Request, res: Response) => {
    const { message } = req.body as SendMessageEndPointBody;

    if (!message) {
      res.status(400).json({ error: "Message vide" });
      return;
    }

    messages.push(message);
    SocketService.getInstance().emitMessage("newMessage", message);

    res.status(200).json({ success: true, message });
  },
};
