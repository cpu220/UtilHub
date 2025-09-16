/**
 * 拼音渲染器 - 基于cnchar库的统一API接口
 * 提供汉字转拼音的功能
 */

import cnchar from 'cnchar';

// cnchar默认包含拼音功能，无需额外导入

/**
 * 拼音配置接口
 */
export interface PinyinConfig {
  /** 是否显示声调 */
  withTone?: boolean;
  /** 拼音样式：数字声调(1) 或 符号声调(ā) */
  toneType?: 'number' | 'symbol';
  /** 是否首字母大写 */
  capitalize?: boolean;
}

/**
 * 拼音结果接口
 */
export interface PinyinResult {
  /** 原始汉字 */
  character: string;
  /** 拼音结果 */
  pinyin: string;
  /** 是否有错误 */
  hasError: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 获取汉字的拼音 - 使用cnchar库
 * @param character 汉字
 * @param config 拼音配置
 * @returns 拼音结果
 */
export function getCharacterPinyin(character: string, config: PinyinConfig = {}): PinyinResult {
  const {
    withTone = true,
    toneType = 'symbol',
    capitalize = false
  } = config;

  if (!character || character.length !== 1) {
    return {
      character,
      pinyin: '',
      hasError: true,
      errorMessage: '请输入单个汉字'
    };
  }

  try {
    // 使用cnchar获取拼音
    let pinyinResult: string | string[];
    
    if (withTone) {
      if (toneType === 'number') {
        // 获取数字声调格式的拼音
        pinyinResult = cnchar.spell(character, 'tone');
      } else {
        // 获取符号声调格式的拼音（默认）
        pinyinResult = cnchar.spell(character, 'tone');
      }
    } else {
      // 获取无声调的拼音
      pinyinResult = cnchar.spell(character, 'low');
    }
    
    // 确保结果是数组格式
    const pinyinArray = Array.isArray(pinyinResult) ? pinyinResult : [pinyinResult];
    
    if (!pinyinArray || pinyinArray.length === 0 || !pinyinArray[0]) {
      return {
        character,
        pinyin: '',
        hasError: true,
        errorMessage: `cnchar库无法获取汉字 "${character}" 的拼音`
      };
    }
    
    let result = pinyinArray[0];
    
    // 处理首字母大写
    if (capitalize && result) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    return {
      character,
      pinyin: result,
      hasError: false
    };
  } catch (error) {
    return {
      character,
      pinyin: '',
      hasError: true,
      errorMessage: `cnchar库获取拼音失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * 批量获取多个汉字的拼音
 * @param characters 汉字字符串
 * @param config 拼音配置
 * @returns 拼音结果数组
 */
export function getMultipleCharactersPinyin(characters: string, config: PinyinConfig = {}): PinyinResult[] {
  return Array.from(characters).map(char => getCharacterPinyin(char, config));
}

/**
 * 获取汉字拼音的简化版本（仅返回拼音字符串，出错时抛出错误）
 * @param character 汉字
 * @param config 拼音配置
 * @returns 拼音字符串
 * @throws 当获取拼音失败时抛出错误
 */
export function getPinyinString(character: string, config: PinyinConfig = {}): string {
  const result = getCharacterPinyin(character, config);
  if (result.hasError) {
    throw new Error(result.errorMessage || '获取拼音失败');
  }
  return result.pinyin;
}