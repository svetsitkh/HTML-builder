const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const stylesFolderPath = path.join(__dirname, 'styles');
const distBundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

async function getArrayOfStylesData(folderPath) {
  const resultArray = [];

  const styleFiles = await fsPromises.readdir(folderPath, {
    withFileTypes: true,
  });
  for await (const file of styleFiles) {
    if (file.isFile()) {
      if (path.extname(file.name) === '.css') {
        const readableStream = fs.createReadStream(
          path.join(folderPath, file.name),
          'utf-8',
        );
        const addChunkToArrayPromise = new Promise((resolve, reject) => {
          readableStream.on('data', (chunk) => {
            resultArray.push(chunk);
            resolve(true);
          });
          readableStream.on('error', (error) => {
            console.error(`Error! ${error.message}`);
            reject(error);
          });
        });
        await addChunkToArrayPromise;
      }
    }
  }

  return resultArray;
}

async function toBundleStyles(stylesFolderPath, distBundlePath) {
  try {
    const stylesDataArray = await getArrayOfStylesData(stylesFolderPath);

    const writableStream = fs.createWriteStream(distBundlePath, 'utf-8');
    stylesDataArray.forEach((dataPart) => {
      writableStream.write(`${dataPart}\n`);
    });
    writableStream.close();
    console.log('Bundle of styles has been created.');
  } catch (error) {
    console.error(`Error! ${error.message}`);
  }
}

toBundleStyles(stylesFolderPath, distBundlePath);
