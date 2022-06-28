import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types';
import {
  conectarMongoDB,
  politicaCORS,
  validarTokenJWT,
} from '../../middlewares/';
import { SeguidorModel, UsuarioModel } from '../../models';

const endpointSeguir = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg>
) => {
  try {
    if (req.method === 'PUT') {
      const { userId, id } = req?.query;

      const usuarioLogado = await UsuarioModel.findById(userId);

      if (!usuarioLogado) {
        return res.status(400).json({ erro: 'Usuário logado não encontrado' });
      }

      const usuarioASerSeguido = await UsuarioModel.findById(id);

      if (!usuarioASerSeguido) {
        return res
          .status(400)
          .json({ mensagem: 'Usuário a ser seguido não encontrado' });
      }

      const jaSigo = await SeguidorModel.find({
        usuarioId: usuarioLogado._id,
        usuarioSeguidoId: usuarioASerSeguido._id,
      });

      if (jaSigo && jaSigo.length > 0) {
        jaSigo.forEach(
          async (e: any) =>
            await SeguidorModel.findByIdAndDelete({ _id: e._id })
        );

        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioLogado._id },
          { $inc: { seguindo: -1 } }
        );

        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioASerSeguido._id },
          { $inc: { seguidores: -1 } }
        );

        return res
          .status(200)
          .json({ mensagem: 'Usuário desseguido com sucesso' });
      } else {
        const seguidor = {
          usuarioId: usuarioLogado._id,
          usuarioSeguidoId: usuarioASerSeguido._id,
        };
        await SeguidorModel.create(seguidor);

        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioLogado._id },
          { $inc: { seguindo: 1 } }
        );

        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioASerSeguido._id },
          { $inc: { seguidores: 1 } }
        );

        return res
          .status(200)
          .json({ mensagem: 'Usuário seguido com sucesso' });
      }
    }
    return res.status(405).json({ mensagem: 'Método informado não é válido' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ mensagem: 'Não foi possível concluir essa ação' });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)));
