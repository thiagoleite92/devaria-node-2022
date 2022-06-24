import type { RespostaPadraoMsg } from './../../types/';
import type { NextApiRequest, NextApiResponse } from 'next';
import { validarTokenJWT, conectarMongoDB } from '../../middlewares';
import { UsuarioModel } from '../../models';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';

const endpointUsuario = nc()
  .use(upload.single('file'))
  .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { userId } = req?.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }

      const { nome } = req?.body;

      if (nome && nome.length > 2) {
        usuario.nome = nome;
      }

      const { file } = req;

      if (file && file.originalname) {
        const image = await uploadImagemCosmic(req);

        if (image && image.media && image.media.url) {
          usuario.avatar = image;
        }
      }

      const updatedUser = await UsuarioModel.findByIdAndUpdate(
        { _id: userId },
        usuario
      );

      return res.status(200).json({
        mensagem: 'Usuário atualizado',
        updatedUser: {
          nome: usuario.nome,
          avatar: usuario.avatar,
        },
      });
    } catch (e) {
      return res
        .status(500)
        .json({ erro: 'Não foi possível atualizar o usuário' });
    }
  })
  .get(
    async (
      req: NextApiRequest,
      res: NextApiResponse<RespostaPadraoMsg | any>
    ) => {
      try {
        const { userId } = req?.query;

        const usuario = await UsuarioModel.findById(userId);

        if (!usuario) {
          return res.status(400).json({ erro: 'Usuário não encontrado' });
        }

        usuario.senha = null;

        return res.status(200).json(usuario);
      } catch (e) {
        return res
          .status(500)
          .json({ erro: 'Não foi possível listar o usuário' });
      }
    }
  );

export const config = {
  api: {
    bodyParser: false,
  },
};

export default validarTokenJWT(conectarMongoDB(endpointUsuario));
