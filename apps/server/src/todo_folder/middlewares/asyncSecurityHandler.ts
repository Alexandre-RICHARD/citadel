import type { NextFunction, Request, RequestHandler, Response } from "express";

import { jwtDecoder } from "../helpers/jwtDecoder.helper";
import { jwtGenerator } from "../helpers/jwtGenerator.helper";

// Typage de la fonction asyncHandler avec prise en charge de la sécurité du JWT
export const asyncSecurityHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorizationToken = req.headers.authorization;
      if (!authorizationToken) {
        res.status(401).json("token_required");
        return;
      }

      const tokenSplit = authorizationToken.split(" ");
      const token = tokenSplit[tokenSplit.length - 1];
      const tokenPayload = jwtDecoder(token);
      if (!tokenPayload) {
        res.status(401).json("token_not_valid");
        return;
      }

      const newToken = jwtGenerator(tokenPayload);
      res.header("Authorization", `Bearer ${newToken}`);
      fn(req, res, next).catch(next);
    } catch (error) {
      next(error);
    }
  };
};
