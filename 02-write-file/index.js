const fs = require('fs');
const path = require('path');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const textFilePath = path.join(__dirname, 'text.txt');
const writableStream = fs.createWriteStream(textFilePath, 'utf-8');

rl.write('Please, enter some text to write it to the file:\n');

rl.on('line', (data) => {
  if (data.trim().toLowerCase() === 'exit') {
    rl.close();
    return;
  }
  writableStream.write(`${data}\n`);
});

rl.on('close', () => {
  writableStream.close();
  console.log('Goodbye! Writing to the file is complete.');
  process.exit(0);
});
