/**
 * Mock工具类
 * 提供各种模拟数据生成功能
 */
// import Mock from 'mockjs';
import { Random } from 'mockjs';

/**
 * 生成随机汉字
 * @param count 要生成的汉字数量，默认为1
 * @returns 生成的随机汉字字符串
 */
export const generateRandomChineseChar = (count: number = 1): string => {
  // Random.cword(min, max) 可以生成指定数量的汉字
  if (count <= 0) return '';
  if (count === 1) {
    return Random.cword(1, 1);
  }
  return Random.cword(count, count);
};

/**
 * 生成指定范围内的随机汉字数组
 * @param min 最小汉字数量
 * @param max 最大汉字数量
 * @returns 生成的随机汉字数组
 */
export const generateRandomChineseCharsArray = (min: number, max: number): string[] => {
  const result: string[] = [];
  const count = Random.integer(min, max);

  for (let i = 0; i < count; i++) {
    result.push(generateRandomChineseChar());
  }

  return result;
};

/**
 * 生成指定长度的随机汉字列表
 * @param length 列表长度
 * @returns 固定长度的随机汉字数组
 */
export const generateChineseCharsList = (length: number): string[] => {
  if (length <= 0) return [];

  const result: string[] = [];

  for (let i = 0; i < length; i++) {
    result.push(generateRandomChineseChar());
  }

  return result;
};

/**
 * 从常用汉字列表中随机选择汉字
 * @param count 要选择的汉字数量
 * @returns 选择的汉字字符串
 */
export const pickRandomCommonChineseChars = (count: number = 1): string => {
  // 常用汉字列表，这里只是一个示例，实际使用中可以扩展更多常用汉字
  const commonChars = '的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感';
  // const commonChars = Random.csentence()
  if (count <= 0) return '';

  let result = '';
  for (let i = 0; i < count; i++) {
    const randomIndex = Random.integer(0, commonChars.length - 1);
    result += commonChars.charAt(randomIndex);
  }

  return result;
};

/**
 * 生成随机的汉字词组
 * @param minLength 词组最小长度
 * @param maxLength 词组最大长度
 * @returns 生成的汉字词组
 */
export const generateRandomChinesePhrase = (minLength: number = 2, maxLength: number = 4): string => {
  const length = Random.integer(minLength, maxLength);
  return generateRandomChineseChar(length);
};

/**
 * 生成固定行数和列数的随机汉字网格数据
 * @param rows 行数
 * @param cols 列数
 * @returns 二维数组，包含行列信息和随机汉字
 */
export const generateRandomChineseCharsGrid = (rows: number, cols: number): Array<Array<{ x: number, y: number, character: string }>> => {
  const grid: Array<Array<{ x: number, y: number, character: string }>> = [];

  for (let i = 0; i < rows; i++) {
    const row: Array<{ x: number, y: number, character: string }> = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        x: j,
        y: i,
        character: generateRandomChineseChar()
      });
    }
    grid.push(row);
  }

  return grid;
};

export const generateRandomChineseCharsString = (count: number = 1): string => {
 
  return Random.csentence(count)
}

/**
 * Mock数据工具类
 */
export const MockUtils = {
  generateRandomChineseChar,
  generateRandomChineseCharsArray,
  generateChineseCharsList,
  pickRandomCommonChineseChars,
  generateRandomChinesePhrase,
  generateRandomChineseCharsGrid,
  generateRandomChineseCharsString

};

export default MockUtils;
 