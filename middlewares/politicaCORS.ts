import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../types';
import NextCors from 'nextjs-cors';

export const politicaCORS =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      await NextCors(req, res, {
        origin: '*',
        methods: ['GET', 'PUT', 'POST'],
        optionSuccessStatus: 200,
      });

      return handler(req, res);
    } catch (error) {
      console.log('Erro ao tratar a polotica de CORS', error);
      return res
        .status(500)
        .json({ mensagem: 'Ocorreu um erro ao tratar a política de CORS' });
    }
  };
