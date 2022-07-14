exports.dirNameQuestion = () => ({
    type: 'input',
    name: 'dirName',
    default: 'json',
    message: '输入存放地图数据目录名称'
})

exports.rootCodeQuestion = () => ({
    type: 'input',
    name: 'rootCode',
    default: '100000',
    message: '输入需要获取地图数据的adcode'
})

exports.rootAreaNameQuestion = () => ({
    type: 'input',
    name: 'rootAreaName',
    default: '中国',
    message: '输入需要获取地图数据的行政名称（如中国）'
})

exports.isYourArea = (name) => ({
    type: 'input',
    name: 'isYourArea',
    default: 'y',
    message: `${name}是否为你需要获取数据的地区名称吗(y/n)`
})