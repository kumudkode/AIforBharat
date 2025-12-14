#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎵 Music × Traffic Dashboard Setup\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists!');
  console.log('📝 You can edit it manually or delete it to run setup again.\n');
  
  // Read current .env to check if API key is set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_lastfm_api_key_here') || !envContent.includes('VITE_LASTFM_API_KEY=')) {
    console.log('⚠️  It looks like your Last.fm API key is not configured yet.');
    askForApiKey();
  } else {
    console.log('🎉 Your Last.fm API key appears to be configured!');
    console.log('🚀 Run "npm run dev" to start the dashboard.\n');
    rl.close();
  }
} else {
  console.log('📋 Setting up your environment variables...\n');
  
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found!');
    process.exit(1);
  }
  
  // Copy .env.example to .env
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env file from template\n');
  
  askForApiKey();
}

function askForApiKey() {
  console.log('🔑 To get real music data, you need a Last.fm API key (it\'s free!)');
  console.log('📖 Visit: https://www.last.fm/api/account/create\n');
  
  rl.question('Enter your Last.fm API key (or press Enter to skip): ', (apiKey) => {
    if (apiKey.trim()) {
      // Update .env file with the API key
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace('your_lastfm_api_key_here', apiKey.trim());
      fs.writeFileSync(envPath, envContent);
      
      console.log('\n✅ API key saved successfully!');
      console.log('🎵 You\'ll now get real music data from Last.fm');
    } else {
      console.log('\n⏭️  Skipped API key setup');
      console.log('🎵 The app will work with mock music data');
      console.log('💡 You can add your API key later by editing the .env file');
    }
    
    console.log('\n🚀 Setup complete! Run "npm run dev" to start the dashboard.');
    console.log('🌐 Open http://localhost:5173 in your browser\n');
    
    rl.close();
  });
}