import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import type { CadastroRequisicao, RespostaPadraoMsg } from '../../types';
import { UsuarioModel } from '../../models';
import md5 from 'md5';

const endpointCadastro = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg>
) => {
  if (req.method === 'POST') {
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

    const newUser = {
      nome: usuario.nome,
      email: usuario.email,
      senha: md5(usuario.senha),
    };

    const usuariosComMesmoEmail = await UsuarioModel.find({
      email: usuario.email,
    });

    if (usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0) {
      return res.status(400).json({ erro: 'Email informado já está em uso' });
    }

    await UsuarioModel.create(newUser);

    return res.status(201).json({ mensagem: 'Usuário criado com sucesso' });
  }

  return res.status(405).json({ erro: 'Método informado não é válido' });
};

export default conectarMongoDB(endpointCadastro);
