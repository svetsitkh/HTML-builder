const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files.forEach((file) => {
      if (file.isFile()) {
        fs.stat(path.join(folderPath, file.name), (err, stats) => {
          if (err) {
            console.log(err);
          } else {
            const fileSize = stats.size + 'b';
            let fileName = file.name;
            let fileExt = path.extname(fileName);
            fileName = fileName.replace(fileExt, '');
            fileExt = fileExt.replace('.', '');

            console.log(fileName, '-', fileExt, '-', fileSize);
          }
        });
      }
    });
  }
});
