import 'dotenv/config';
import { getMongoURI } from './dist/shared/helpers/database.js';

console.log('Testing getMongoURI function:');
const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '27017',
  DB_NAME = 'six-cities',
  DB_USER = '',
  DB_PASSWORD = '',
  DB_AUTH_SOURCE = 'admin',
} = process.env;

console.log('Without auth:', getMongoURI('', '', DB_HOST, DB_PORT, DB_NAME));
console.log('With auth:', getMongoURI(DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_AUTH_SOURCE));
