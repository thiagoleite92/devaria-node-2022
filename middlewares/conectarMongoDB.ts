import { RespostaPadraoMsg } from './../types/RespostaPadraoMsg';
import type { NextApiResponse, NextApiRequest, NextApiHandler } from 'next';
import mongoose from 'mongoose';

export const conectarMongoDB =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (mongoose.connections[0].readyState) {
      return handler(req, res);
    }

    const { DB_CONEXAO_STRING } = process.env;

    if (!DB_CONEXAO_STRING) {
      return res
        .status(500)
        .json({ erro: 'Env de configuração de banco não informada' });
    }

    mongoose.connection.on('connected', () =>
      console.log('Banco de dados conectado')
    );
    mongoose.connection.on('error', (error) =>
      console.log('Ocorreu um erro ao conectar: ' + error)
    );
    await mongoose.connect(DB_CONEXAO_STRING);

    return handler(req, res);
  };
