import { RespostaPadraoMsg } from './../../types/';
import type { NextApiRequest, NextApiResponse } from 'next';
import { validarTokenJWT, conectarMongoDB } from '../../middlewares';
import { PublicacaoModel, UsuarioModel } from '../../models';

const endpointFeed = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => {
  try {
    if (req.method === 'GET') {
      if (req?.query?.id) {
        const { id } = req?.query;

        const usuario = await UsuarioModel.findById(id);

        if (!usuario) {
          return res.status(200).json({ erro: 'Usuário não encontrado' });
        }

        const publicacoes = await PublicacaoModel.find({
          idUsuario: id,
        }).sort({ data: -1 });

        return res.status(200).json(publicacoes);
      }
    }
    return res.status(400).json({ erro: 'Método informado não é válido' });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível obter o feed' });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointFeed));
