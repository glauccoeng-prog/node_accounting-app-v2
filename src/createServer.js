'use strict';

const express = require('express');

function createServer() {
  const app = express();

  app.use(express.json());

  // Armazenamento em memória (limpo a cada chamada do createServer)
  const users = [];
  const expenses = [];
  let userIdCounter = 0;
  let expenseIdCounter = 0;

  // ==================== USUÁRIOS ====================

  // POST /users - Cria um novo usuário
  app.post('/users', (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newUser = {
      id: ++userIdCounter,
      name,
    };

    users.push(newUser);

    res.status(201).json(newUser);
  });

  // GET /users - Retorna todos os usuários
  app.get('/users', (req, res) => {
    res.status(200).json(users);
  });

  // GET /users/:id - Retorna um usuário pelo ID
  app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  });

  // PATCH /users/:id - Atualiza um usuário
  app.patch('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.assign(user, req.body);

    res.status(200).json(user);
  });

  // DELETE /users/:id - Remove um usuário
  app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(index, 1);

    res.sendStatus(204);
  });

  // ==================== DESPESAS ====================

  // POST /expenses - Cria uma nova despesa
  app.post('/expenses', (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (!userId || !spentAt || !title || !amount || !category || !note) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = users.find((u) => u.id === userId);

    if (!userExists) {
      return res.status(400).json({ message: 'User not found' });
    }

    const newExpense = {
      id: ++expenseIdCounter,
      userId,
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(newExpense);

    res.status(201).json(newExpense);
  });

  // GET /expenses - Retorna todas as despesas (com filtros opcionais)
  app.get('/expenses', (req, res) => {
    const { userId, from, to, categories } = req.query;

    let filtered = [...expenses];

    if (userId) {
      filtered = filtered.filter((e) => e.userId === Number(userId));
    }

    if (from) {
      const fromDate = new Date(from);

      filtered = filtered.filter((e) => new Date(e.spentAt) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);

      filtered = filtered.filter((e) => new Date(e.spentAt) <= toDate);
    }

    if (categories) {
      const categoryList = categories.split(',');

      filtered = filtered.filter((e) => categoryList.includes(e.category));
    }

    res.status(200).json(filtered);
  });

  // GET /expenses/:id - Retorna uma despesa pelo ID
  app.get('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(expense);
  });

  // PATCH /expenses/:id - Atualiza uma despesa
  app.patch('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    Object.assign(expense, req.body);

    res.status(200).json(expense);
  });

  // DELETE /expenses/:id - Remove uma despesa
  app.delete('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expenses.splice(index, 1);

    res.sendStatus(204);
  });

  return app;
}

module.exports = {
  createServer,
};
