import 'dotenv/config';
import mongoose from 'mongoose';
import { getMongoURI } from './dist/shared/helpers/database.js';

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '27017',
  DB_NAME = 'six-cities',
  DB_USER = '',
  DB_PASSWORD = '',
  DB_AUTH_SOURCE = 'admin',
} = process.env;

async function testMongoDBWithAuth() {
  try {
    console.log('🔍 Testing MongoDB connection with auth...');

    // Подключение к MongoDB с аутентификацией
    const uri = getMongoURI(DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_AUTH_SOURCE);
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Тест создания простой коллекции
    const testSchema = new mongoose.Schema({
      name: String,
      created: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Создание тестового документа
    const testDoc = await TestModel.create({ name: 'MongoDB Test with Auth' });
    console.log('✅ Test document created:', testDoc._id);
    
    // Поиск документа
    const foundDoc = await TestModel.findById(testDoc._id);
    console.log('✅ Test document found:', foundDoc.name);
    
    // Удаление тестового документа
    await TestModel.findByIdAndDelete(testDoc._id);
    console.log('✅ Test document deleted');
    
    // Закрытие соединения
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed');
    
    console.log('\n🎉 MongoDB with authentication is working correctly!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    process.exit(1);
  }
}

testMongoDBWithAuth();
