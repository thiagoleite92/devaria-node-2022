import { RespostaPadraoMsg } from './../../types/';
import type { NextApiRequest, NextApiResponse } from 'next';
import { validarTokenJWT, conectarMongoDB } from '../../middlewares';
import { UsuarioModel } from '../../models';

const endpointUsuario = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => {
  try {
    if (req.method === 'GET') {
      const { userId } = req?.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }

      usuario.senha = null;

      return res.status(200).json(usuario);
    }
    return res.status(400).json({ erro: 'Método informado não é válido' });
  } catch (e) {
    return res.status(500).json({ erro: 'Houve algum erro no servidor' });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointUsuario));
