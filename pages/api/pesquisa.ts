import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB, validarTokenJWT } from '../../middlewares';
import { UsuarioModel } from '../../models';
import type { RespostaPadraoMsg } from '../../types';

const endpointPesquisa = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => {
  try {
    if (req.method === 'GET') {
      if (req?.query?.id) {
        const { id } = req.query;

        const userById = await UsuarioModel.findById({ _id: id });

        userById.senha = null;

        return res.status(200).json(userById);
      } else {
        const { filtro } = req?.query;

        if (!filtro || filtro.length < 2) {
          return res
            .status(400)
            .json({ erro: 'O filtro precisa ter pelo menos 2 caracteres' });
        }

        const usuariosEncontrados = await UsuarioModel.find({
          $or: [
            { nome: { $regex: filtro, $options: 'i' } },
            { email: { $regex: filtro, $options: 'i' } },
          ],
        });

        const usuariosSanitizados = usuariosEncontrados.map((usuario) => ({
          nome: usuario.nome,
          email: usuario.email,
          avatar: usuario.avatar,
        }));

        return res.status(200).json(usuariosSanitizados);
      }
    }
    return res.status(405).json({ mensagem: 'Método informado não é válido' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ mensagem: 'Não foi possível buscar usuários' });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointPesquisa));
