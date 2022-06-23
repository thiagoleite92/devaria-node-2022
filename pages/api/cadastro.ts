import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import type { CadastroRequisicao, RespostaPadraoMsg } from '../../types';
import { UsuarioModel } from '../../models';
import md5 from 'md5';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import nc from 'next-connect';

const handler = nc()
  .use(upload.single('file'))
  .post(
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
      try {
        console.log('cadastro endpoint', req);
        const usuario = req.body as CadastroRequisicao;

        if (!usuario.nome || usuario.nome.length < 2) {
          return res.status(400).json({ erro: 'Nome inválido' });
        }

        if (
          !usuario.email ||
          usuario.email.length < 5 ||
          !usuario.email.includes('@') ||
          !usuario.email.includes('.')
        ) {
          return res.status(400).json({ erro: 'Email inválido' });
        }

        if (!usuario.senha || usuario.senha.length < 4) {
          return res.status(400).json({ erro: 'Senha inválida' });
        }

        const usuariosComMesmoEmail = await UsuarioModel.find({
          email: usuario.email,
        });

        if (usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0) {
          return res
            .status(400)
            .json({ erro: 'Email informado já está em uso' });
        }

        const image = await uploadImagemCosmic(req);

        const newUser = {
          nome: usuario.nome,
          email: usuario.email,
          senha: md5(usuario.senha),
          avatar: image?.media?.url,
        };

        await UsuarioModel.create(newUser);

        return res.status(201).json({ mensagem: 'Usuário criado com sucesso' });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ mensagem: 'Usuário não cadastrado' });
      }
    }
  );

export const config = {
  api: {
    bodyParser: false,
  },
};

export default conectarMongoDB(handler);
