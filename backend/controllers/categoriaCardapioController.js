const categoriaCardapioService = require('../services/categoriaCardapioService');

class CategoriaCardapioController {
  // Criar nova categoria
  async create(req, res, next) {
    try {
      const categoria = await categoriaCardapioService.create(
        req.restauranteId,
        req.body
      );
      res.status(201).json({
        message: 'Categoria criada com sucesso',
        categoria
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar categorias do restaurante autenticado
  async list(req, res, next) {
    try {
      const categorias = await categoriaCardapioService.listByRestaurante(
        req.restauranteId
      );
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar categoria
  async update(req, res, next) {
    try {
      const categoria = await categoriaCardapioService.update(
        req.restauranteId,
        req.params.id,
        req.body
      );
      res.json({
        message: 'Categoria atualizada com sucesso',
        categoria
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar categoria
  async delete(req, res, next) {
    try {
      await categoriaCardapioService.delete(req.restauranteId, req.params.id);
      res.json({
        message: 'Categoria deletada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoriaCardapioController();
