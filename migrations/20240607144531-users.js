/* eslint-disable @typescript-eslint/no-var-requires */
const { HashService } = require('./../dist/hash/hash.service');
const mongoose = require('mongoose');

const hashService = new HashService();

module.exports = {
  async up(db) {
    const users = [
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d01'),
        username: 'userForSignIn',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d02'),
        username: 'userForUpdateData',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d03'),
        username: 'userForInvalidUpdate',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d04'),
        username: 'userForDelete',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d05'),
        username: 'userForInvalidDelete',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d06'),
        username: 'admin',
        password: await hashService.hashPassword('admin'),
        firstName: 'FirstName',
        role: 'admin',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d07'),
        username: 'userWhoVote',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d09'),
        username: 'userWhoVote2',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d08'),
        username: 'userForVote',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
      {
        _id: new mongoose.Types.ObjectId('60d5ecf5f9d74e30c8d59d10'),
        username: 'userForAvatarUpload',
        password: await hashService.hashPassword('password'),
        firstName: 'FirstName',
        role: 'user',
        rating: 0,
        deletedAt: null,
      },
    ];
    await db.collection('users').insertMany(users);
  },
};
