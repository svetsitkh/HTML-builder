const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

async function copyFolder(folderPath1, folderPath2) {
  try {
    await fsPromises.mkdir(folderPath2, { recursive: true });

    const filesToDelete = await fsPromises.readdir(folderPath2);
    for (const file of filesToDelete) {
      await fsPromises.unlink(path.join(folderPath2, file));
    }

    const filesToCopy = await fsPromises.readdir(folderPath1);
    for (const file of filesToCopy) {
      await fsPromises.copyFile(
        path.join(folderPath1, file),
        path.join(folderPath2, file),
      );
      console.log('copied file: ', file);
    }

    console.log('All files have been copied to the folder files-copy.');
  } catch (error) {
    console.error(`Error! ${error.message}`);
  }
}

const originFolderPath = path.join(__dirname, 'files');
const copyFolderPath = path.join(__dirname, 'files-copy');

copyFolder(originFolderPath, copyFolderPath);
