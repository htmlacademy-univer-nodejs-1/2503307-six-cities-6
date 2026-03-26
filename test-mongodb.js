import 'dotenv/config';
import mongoose from 'mongoose';

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '27017',
  DB_NAME = 'six-cities',
} = process.env;

async function testMongoDB() {
  try {
    console.log('🔍 Testing MongoDB connection...');

    // Подключение к MongoDB
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Тест создания простой коллекции
    const testSchema = new mongoose.Schema({
      name: String,
      created: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Создание тестового документа
    const testDoc = await TestModel.create({ name: 'MongoDB Test' });
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
    
    console.log('\n🎉 MongoDB is working correctly!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    process.exit(1);
  }
}

testMongoDB();
