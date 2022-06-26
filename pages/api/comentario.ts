import { PublicacaoModel } from './../../models/PublicacaoModel';
import { RespostaPadraoMsg } from './../../types/';
import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB, validarTokenJWT } from '../../middlewares';
import { UsuarioModel } from '../../models';

const endpointComentario = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg>
) => {
  try {
    if (req.method === 'PUT') {
      const { userId, id } = req?.query;

      const usuarioLogado = await UsuarioModel.findById(userId);

      if (!usuarioLogado) {
        return res.status(400).json({ mensagem: 'Usuario não encontrado' });
      }

      const publicacao = await PublicacaoModel.findById(id);

      if (!publicacao) {
        return res.status(400).json({ mensagem: 'Publicacao não encontrada' });
      }

      if (!req.body || !req.body.comentario || req.body.comentario.length < 2) {
        return res.status(400).json({ mensagem: 'Comentário não é válido' });
      }

      const comentario = {
        idUsuario: usuarioLogado._id,
        nome: usuarioLogado.nome,
        comentario: req.body.comentario,
      };

      publicacao.comentarios.push(comentario);

      await PublicacaoModel.findByIdAndUpdate(
        { _id: publicacao._id },
        publicacao
      );

      return res
        .status(200)
        .json({ mensagem: 'Comentario adicionado com sucesso!' });
    }

    return res.status(405).json({ erro: 'Método informado não inválido' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ erro: 'Erro ao adicionar comentário' });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointComentario));
