const fs = require("fs");
const namesControlles = fs.readdirSync(__dirname);

module.exports = (app) => {
    namesControlles.forEach(element => {
        const filename = element.replace(".js", "");
        if (filename!=="index") {
            require(`${__dirname}/${filename}`)(app);
        }
    });
}