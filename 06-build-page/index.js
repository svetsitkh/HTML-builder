const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

async function getFileContent(readableStream) {
  let data = '';
  const getFileContentPromise = new Promise((resolve, reject) => {
    readableStream.on('data', (chunk) => (data += chunk));
    readableStream.on('end', resolve);
    readableStream.on('error', (error) => {
      console.error(`Error! ${error.message}`);
      reject(error);
    });
  });
  await getFileContentPromise;
  return data;
}

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
    console.log('Bundle file style.css has been created.');
  } catch (error) {
    console.error(`Error! ${error.message}`);
  }
}

async function copyFolder(folderPath1, folderPath2) {
  await fsPromises.mkdir(folderPath2, { recursive: true });

  const filesToCopy = await fsPromises.readdir(folderPath1, {
    withFileTypes: true,
  });
  for (const file of filesToCopy) {
    if (file.isDirectory()) {
      await copyFolder(
        path.join(folderPath1, file.name),
        path.join(folderPath2, file.name),
      );
    } else if (file.isFile()) {
      await fsPromises.copyFile(
        path.join(folderPath1, file.name),
        path.join(folderPath2, file.name),
      );
    }
  }
}

async function toBundlePage() {
  const projectDistPath = path.join(__dirname, 'project-dist');
  try {
    //re-creating the 'project-dist' folder
    await fsPromises.rm(projectDistPath, { force: true, recursive: true });
    await fsPromises.mkdir(projectDistPath, { recursive: true });

    //creating index.html from template
    const readableStream = fs.createReadStream(
      path.join(__dirname, 'template.html'),
      'utf-8',
    );
    let pageTemplate = await getFileContent(readableStream);

    const componentsFolderPath = path.join(__dirname, 'components');
    const pageComponentsFiles = await fsPromises.readdir(componentsFolderPath, {
      withFileTypes: true,
    });
    for await (const file of pageComponentsFiles) {
      if (file.isFile()) {
        let fileName = file.name;
        const fileExt = path.extname(fileName);
        if (fileExt === '.html') {
          const readableStreamForComponent = fs.createReadStream(
            path.join(componentsFolderPath, fileName),
            'utf-8',
          );
          const pageComponent = await getFileContent(
            readableStreamForComponent,
          );

          if (pageComponent.length > 0) {
            const componentName = fileName.replace(fileExt, '');
            pageTemplate = pageTemplate.replace(
              `{{${componentName}}}`,
              pageComponent,
            );
          }
        }
      }
    }

    const writableStream = fs.createWriteStream(
      path.join(projectDistPath, 'index.html'),
      'utf-8',
    );
    writableStream.write(pageTemplate);
    writableStream.close();
    console.log('File index.html has been created.');

    //creating the style.css bundle file
    await toBundleStyles(
      path.join(__dirname, 'styles'),
      path.join(projectDistPath, 'style.css'),
    );

    //copying assets files
    await copyFolder(
      path.join(__dirname, 'assets'),
      path.join(projectDistPath, 'assets'),
    );
    console.log(
      'All assets files have been copied to the folder project-dist.',
    );
  } catch (error) {
    console.error(`Error! ${error.message}`);
  }
}

toBundlePage();
