import type { NextApiResponse } from 'next';
import { conectarMongoDB, validarTokenJWT } from '../../middlewares/';
import { UsuarioModel, PublicacaoModel } from '../../models';
import type { RespostaPadraoMsg } from '../../types';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import nc from 'next-connect';

const handler = nc()
  .use(upload.single('file'))
  .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { userId } = req.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: 'Usuario não encontrado' });
      }

      if (!req || !req.body) {
        return res
          .status(400)
          .json({ erro: 'Parametros de entrada não informados' });
      }

      const { descricao } = req?.body;

      if (!descricao || descricao.length < 2) {
        return res.status(400).json({ erro: 'Descriçao inválida' });
      }

      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: 'Imagem é obrigatória' });
      }

      const image = await uploadImagemCosmic(req);

      const publicacao = {
        idUsuario: usuario._id,
        descricao,
        foto: image.media.url,
        data: new Date(),
      };

      await PublicacaoModel.create(publicacao);
      await UsuarioModel.findByIdAndUpdate(
        { _id: usuario._id },
        { $inc: { publicacoes: 1 } }
      );

      return res
        .status(201)
        .json({ mensagem: 'Publicacao criada com sucesso' });
    } catch (err: any) {
      return res.status(500).json({ mensagem: err.toString() });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default validarTokenJWT(conectarMongoDB(handler));
