/// <reference types="node" />

import { generateCourseContent } from '../src/utils/promptEngine.js';

async function testCourseGeneration() {
  try {
    console.log('🚀 Testing course generation with Mistral 7B...');
    const topic = 'Introduction to TypeScript';
    
    console.log(`\n📝 Topic: ${topic}`);
    console.log('⏱️  Starting generation...');
    
    const startTime = Date.now();
    
    console.log('\n🔍 Sending request to Ollama...');
    const content = await generateCourseContent(topic);
    
    const duration = (Date.now() - startTime) / 1000;
    
    console.log('\n✅ Course generated successfully!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log('\nGenerated content:');
    console.log('-----------------');
    console.log(content);
    
  } catch (error) {
    console.error('\n❌ Error generating course:');
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if ('stack' in error) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the test
testCourseGeneration();
