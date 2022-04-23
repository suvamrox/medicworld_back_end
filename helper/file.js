let fs = require("fs");
exports.uploadImages = (path, images, cb) => {
    let filesName = [];
    fs.mkdir(path, { recursive: true }, function (err) {
        if (err) console.log(err);
        else {
            for (let i = 0; i < images.length; i++) {
                let base64Data = images[i].replace(/^data:image\/png;base64,/, "");
                filesName.push(`${i}.png`);
                fs.writeFile(`${path}/${i}.png`, base64Data, 'base64', function (err) {
                    if (err) console.log(err);
                });

            }
            cb(filesName);
        }
    });
}