const path = require("path");
const fs = require("fs");
const clear = require("clear");
const figlet = require("figlet");
const c = require("ansi-colors");
const { log } = require("./log");
const axios = require("axios");
const createConfig = require("./createConfig");
const findAreaCode = require("./findAreaCode");

let failFetchCount = 0;
let failFetchCodes = [];

function insertFailCode(code, dirPath, hasChildren) {
  if (failFetchCodes.length === 0) {
    failFetchCodes.push({
      code,
      dirPath,
      hasChildren,
    });
  } else {
    const index = failFetchCodes.findIndex((item) => item.code === code);
    if (index === -1) {
      failFetchCodes.push({
        code,
        dirPath,
        hasChildren,
      });
    }
  }
}
const fetchFn = async (code, dirPath, hasChildren = true) => {
  let rootPath = process.cwd() + "/fetchMap";
  const url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}${
    hasChildren ? "_full" : ""
  }.json`;
  try {
    const { data } = await axios.get(url);
    fs.writeFile(`${dirPath}/${code}.json`, JSON.stringify(data), (err) => {
      if (err) {
        if (failFetchCount > 3) {
          console.log(`${code}.json 文件写入失败: ${err}`);
          log(
            `${rootPath}/error.log`,
            `${code}.json 文件写入失败: ${err}    ${new Date()}`
          );
        } else {
          insertFailCode(code, dirPath, hasChildren);
        }
      }
      console.log(c.green(`${code}.json 文件写入成功`));
      log(
        `${rootPath}/success.log`,
        `${code}.json 文件写入成功   ${new Date()}`
      );
    });
    const { features } = data;
    if (features[0]["properties"]["adcode"] !== code) {
      features.forEach((feature) => {
        const {
          adcode: _code,
          childrenNum: _hasChildren,
          name: _name,
        } = feature.properties;
        // generateJsonMap(_code, _name);
        fetchFn(_code, dirPath, _hasChildren);
      });
    }
  } catch (error) {
    if (failFetchCount > 3) {
      console.log(`${code}.json 文件写入失败: ${err}`);
      log(
        `${rootPath}/error.log`,
        `${code}.json 文件写入失败: ${err}    ${new Date()}`
      );
    } else {
      insertFailCode(code, dirPath, hasChildren);
    }
  }
};

const run = async () => {
  clear();
  console.log(
    c.blue(figlet.textSync("FetchMap", { horizontalLayout: "full" }))
  );
  // 生成文件根目录
  let rootPath = process.cwd() + "/fetchMap";
  try {
    fs.accessSync(rootPath);
  } catch (error) {
    // 不存在则创建
    fs.mkdirSync(rootPath);
  }
  config = await createConfig();
  // 获取地区编码
  const code = await findAreaCode(config.rootAreaName);
  const dirPath = path.resolve(rootPath, "mapjson");
  // // 创建之前先检测目录是否已经存在
  try {
    fs.accessSync(dirPath);
  } catch (error) {
    // 不存在则创建
    fs.mkdirSync(dirPath);
  }
  await fetchFn(code, dirPath);

  // 失败重新拉取
  if (failFetchCodes.length > 0 && failFetchCount < 4) {
    failFetchCount++;
    console.log(`开始对获取失败数据进行第${failFetchCount}次重新拉取`);
    failFetchCodes.forEach((item) => {
      fetchFn(item.code, item.dirPath, item.hasChildren);
    });
  }
};
const generateJsonMap = (code, name) => {
  imports += `\n import ${name} from './${config.dirname}/${code}.json'`;
  codemapjson[code] = name;
  treecodemap[name] = code;
  const content =
    imports +
    "\n\n\n\n" +
    `export const codemapjson = ${JSON.stringify(codemapjson).replace(
      /\"/g,
      ""
    )}` +
    "\n\n\n\n" +
    `export const treecodemap = ${JSON.stringify(treecodemap)}`;
  fs.writeFile(path.resolve(__dirname, "codemapjson.js"), content, (err) => {
    if (err) console.log(err);
  });
};

run();
