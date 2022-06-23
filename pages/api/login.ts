import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import { LoginResposta, RespostaPadraoMsg } from '../../types';

const endpointLogin = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | LoginResposta>
) => {
  const { MINHA_CHAVE_JWT } = process.env;
  if (!MINHA_CHAVE_JWT) {
    return res.status(500).json({ erro: 'ENV Jwt não informado' });
  }

  if (req.method === 'POST') {
    const { login, senha } = req.body;

    const usuariosEncontrados = await UsuarioModel.find({
      email: login,
      senha: md5(senha),
    });

    if (usuariosEncontrados && usuariosEncontrados.length > 0) {
      const usuarioEncontrado = usuariosEncontrados[0];

      const token = jwt.sign(
        {
          _id: usuarioEncontrado._id,
          nome: usuarioEncontrado.nome,
          email: usuarioEncontrado.email,
        },
        MINHA_CHAVE_JWT
      );

      return res.status(200).json({
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        token,
      });
    }
  }

  res.status(200).json({ erro: 'Método informado não é válido' });
};

export default conectarMongoDB(endpointLogin);
