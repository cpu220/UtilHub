/**
 * 数据模块统一导出
 * 提供Mock数据生成和字库数据功能
 */

// Mock数据生成器
export {
  generateRandomChineseChar,
  generateRandomChineseCharsArray,
  generateChineseCharsList,
  pickRandomCommonChineseChars,
  generateRandomChinesePhrase,
  generateRandomChineseCharsGrid,
  generateRandomChineseCharsString,
  MockUtils
} from './mock.generator';

// 字库数据
// export * from './font.library'; // 暂时注释，文件为空