import type { NextApiRequest, NextApiResponse } from 'next';
import {
  conectarMongoDB,
  validarTokenJWT,
  politicaCORS,
} from '../../middlewares';
import { PublicacaoModel, UsuarioModel } from '../../models';
import type { RespostaPadraoMsg } from '../../types';

const endpointLike = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg>
) => {
  try {
    if (req.method === 'PUT') {
      const { id } = req?.query;

      const publicacao = await PublicacaoModel.findById(id);

      if (!publicacao) {
        return res.status(400).json({ erro: 'Publicacao não encontrada' });
      }

      const { userId } = req?.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: 'Usuario não encontrada' });
      }

      const indexDoUsuarioNoArrayDeLikes = publicacao.likes.findIndex(
        (e: any) => e.toString() === usuario._id.toString()
      );

      if (indexDoUsuarioNoArrayDeLikes != -1) {
        publicacao.likes.splice(indexDoUsuarioNoArrayDeLikes, 1);
        await PublicacaoModel.findByIdAndUpdate(
          { _id: publicacao._id },
          publicacao
        );
        return res
          .status(200)
          .json({ mensagem: 'Publicao descurtida com sucesso' });
      } else {
        publicacao.likes.push(usuario._id);
        await PublicacaoModel.findByIdAndUpdate(
          { _id: publicacao._id },
          publicacao
        );
        return res
          .status(200)
          .json({ mensagem: 'Publicacao curtida com sucesso' });
      }
    }

    return res.status(405).json({ erro: 'Método não informado não é válido' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ erro: 'Não foi possível dar likes' });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointLike)));
