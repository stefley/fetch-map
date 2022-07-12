const fs = require('fs')

const options = {
    flags: 'a', // 打开文件以添加。如果文件不存在，则创建该文件
}
exports.log = function (filePath, info) {
    const stderr = fs.createWriteStream(filePath, options)
    const logger = new console.Console(stderr)

    logger.log(info)
}