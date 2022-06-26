import { RespostaPadraoMsg } from './../../types/';
import type { NextApiRequest, NextApiResponse } from 'next';
import { validarTokenJWT, conectarMongoDB } from '../../middlewares';
import { PublicacaoModel, SeguidorModel, UsuarioModel } from '../../models';

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
      } else {
        const { userId } = req?.query;

        const usuarioLogado = await UsuarioModel.findById(userId);

        if (!usuarioLogado) {
          return res.status(400).json({ erro: 'Usuario não encontrado' });
        }

        const usuariosSeguidos = await SeguidorModel.find({
          usuarioLogado: usuarioLogado._id,
        });

        const idsUsuariosSeguidos = usuariosSeguidos.map(
          (usuario) => usuario.usuarioSeguidoId
        );

        const publicacoes = await PublicacaoModel.find({
          $or: [
            { idUsuario: usuarioLogado._id },
            { idUsuario: idsUsuariosSeguidos },
          ],
        }).sort({ data: -1 });

        const result = [];

        for (const publicacao of publicacoes) {
          const usuarioDaPublicacao = await UsuarioModel.findById(
            publicacao.idUsuario
          );
          if (usuarioDaPublicacao) {
            const final = {
              ...publicacao._doc,
              usuario: {
                nome: usuarioDaPublicacao.nome,
                avatar: usuarioDaPublicacao.avatar,
              },
            };
            result.push(final);
          }
        }

        return res.status(200).json(result);
      }
    }
    return res.status(400).json({ erro: 'Método informado não é válido' });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível obter o feed' });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointFeed));
