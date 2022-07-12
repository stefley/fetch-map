const { name2Code } = require("./codeMap");
const inquirer = require("inquirer");
const { isYourArea } = require("./questions");

module.exports = async function (code) {
  // 判断用户输入的是code还是name
  const isCode = isNaN(code);
  // 如果用户输入的是code直接返回
  if (!isCode) {
    return code;
  } else {
    if (name2Code[code]) {
      return name2Code[code];
    } else {
      try {
        return await funzzyQueryCode(code);
      } catch (error) {
        console.log(error);
      }
    }
  }
};

// 模糊匹配用户输入地区名称
async function funzzyQueryCode(c) {
  let names = Object.keys(name2Code),
    code;
  names = names.filter((v) => v.includes(c));
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const isYourNeed = await askIsYourArea(name);
    if (isYourNeed === "y") {
      // 如果命中用户需要获取的地区，退出循环
      code = name2Code[name];
      break;
    }
  }
  if (!code) {
    throw new Error(`没有找到${c}的地区数据,请检查地区名称是否正确`);
  } else {
    return code;
  }
}

const askIsYourArea = async (name) => {
  const answer = await inquirer.prompt([isYourArea(name)]);
  return answer.isYourArea.trim();
};
