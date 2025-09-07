/**
 * 基于 hanzi-writer 的汉字渲染工具
 * 提供统一的字体大小控制，与 cnchar-draw 保持一致
 */

import HanziWriter from 'hanzi-writer';

// 默认配置选项
const defaultOptions = {
  width: 100,
  height: 100,
  fontSize: 100, // 统一字体大小参数
  padding: 5,
  strokeWidth: 5,
  strokeColor: '#555',
  radicalColor: '#ff0000',
  useGridBackground: false,
  gridColor: '#DDD',
  useLocalData: true, // 控制是否使用本地字库
  showOutline: true
};

// 存储已创建的writer实例引用
const writerInstances = new Map<string, any>();

// 本地字库数据缓存
const localCharacterDataCache = new Map<string, any>();

/**
 * 安全清理容器内容
 * @param container 容器元素
 * @returns 是否清理成功
 */
export const safelyClearContainer = (container: HTMLElement | null): boolean => {
  if (!container) {
    return false;
  }
  
  try {
    // 清空所有子元素
    container.innerHTML = '';
    // 重置容器样式
    container.style.position = '';
    return true;
  } catch (error) {
    console.warn('清理容器内容时出错:', error);
    return false;
  }
};

/**
 * 创建米字格背景
 * @param container 容器元素
 * @param width 宽度
 * @param height 高度
 * @param gridColor 网格颜色
 * @returns 新创建的SVG元素ID
 */
const createGridBackground = (container: HTMLElement, width: number, height: number, gridColor: string): string => {
  const svgId = `hanzi-grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
  svg.setAttribute('id', svgId);
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.style.display = 'block';
  svg.style.border = `1px solid ${gridColor}`;
  svg.style.boxSizing = 'border-box';
  
  // 创建米字格线条
  const centerX = width / 2;
  const centerY = height / 2;
  
  // 外边框
  const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  border.setAttribute('x', '0');
  border.setAttribute('y', '0');
  border.setAttribute('width', width.toString());
  border.setAttribute('height', height.toString());
  border.setAttribute('fill', 'none');
  border.setAttribute('stroke', gridColor);
  border.setAttribute('stroke-width', '1');
  
  // 水平中线
  const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  horizontalLine.setAttribute('x1', '0');
  horizontalLine.setAttribute('y1', centerY.toString());
  horizontalLine.setAttribute('x2', width.toString());
  horizontalLine.setAttribute('y2', centerY.toString());
  horizontalLine.setAttribute('stroke', gridColor);
  horizontalLine.setAttribute('stroke-width', '1');
  horizontalLine.setAttribute('stroke-dasharray', '3,3');
  
  // 垂直中线
  const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  verticalLine.setAttribute('x1', centerX.toString());
  verticalLine.setAttribute('y1', '0');
  verticalLine.setAttribute('x2', centerX.toString());
  verticalLine.setAttribute('y2', height.toString());
  verticalLine.setAttribute('stroke', gridColor);
  verticalLine.setAttribute('stroke-width', '1');
  verticalLine.setAttribute('stroke-dasharray', '3,3');
  
  // 对角线1 (左上到右下)
  const diagonalLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonalLine1.setAttribute('x1', '0');
  diagonalLine1.setAttribute('y1', '0');
  diagonalLine1.setAttribute('x2', width.toString());
  diagonalLine1.setAttribute('y2', height.toString());
  diagonalLine1.setAttribute('stroke', gridColor);
  diagonalLine1.setAttribute('stroke-width', '1');
  diagonalLine1.setAttribute('stroke-dasharray', '3,3');
  
  // 对角线2 (右上到左下)
  const diagonalLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonalLine2.setAttribute('x1', width.toString());
  diagonalLine2.setAttribute('y1', '0');
  diagonalLine2.setAttribute('x2', '0');
  diagonalLine2.setAttribute('y2', height.toString());
  diagonalLine2.setAttribute('stroke', gridColor);
  diagonalLine2.setAttribute('stroke-width', '1');
  diagonalLine2.setAttribute('stroke-dasharray', '3,3');
  
  // 添加所有元素到SVG（边框在最下层）
  svg.appendChild(border);
  svg.appendChild(horizontalLine);
  svg.appendChild(verticalLine);
  svg.appendChild(diagonalLine1);
  svg.appendChild(diagonalLine2);
  
  // 将SVG添加到容器
  container.appendChild(svg);
  
  return svgId;
};

/**
 * 加载本地汉字数据
 * @param character 汉字字符
 * @returns 汉字数据或null
 */
const loadLocalCharacterData = (character: string): any => {
  try {
    // 先检查缓存
    if (localCharacterDataCache.has(character)) {
      return localCharacterDataCache.get(character);
    }
    
    // 尝试从本地字库加载
    const characterData = require(`hanzi-writer-data/${character}`);
    localCharacterDataCache.set(character, characterData);
    return characterData;
  } catch (error) {
    console.warn(`本地字库中未找到字符"${character}"，将使用在线数据`);
    return null;
  }
};

/**
 * 在指定容器中渲染汉字
 * @param svgId 容器ID
 * @param character 要渲染的汉字
 * @param options 可选配置项
 * @returns HanziWriter实例
 */
export const renderHanziInContainer = (svgId: string, character: string, options?: any) => {
  const _opt = {
    ...defaultOptions,
    ...options,
  };

  // 字符验证
  if (!character || character.length === 0) {
    console.warn('字符为空，无法渲染');
    return;
  }

  // 只取第一个字符
  const str = character.length > 1 ? character[0] : character;

  // 获取容器元素
  const container = document.getElementById(svgId);
  if (!container) {
    console.error(`未找到ID为"${svgId}"的容器`);
    return;
  }

  try {
    // 统一字体大小计算：直接使用 fontSize 参数
    const fontSize = _opt.fontSize || _opt.width || 100;
    
    // 创建配置对象
    const writerOptions = { 
      ..._opt,
      width: fontSize,
      height: fontSize,
      padding: _opt.padding || 5
    };



    // 如果需要使用本地字库，根据官方API方式设置charDataLoader
    if (_opt.useLocalData) {
      writerOptions.charDataLoader = function () {
        return loadLocalCharacterData(str);
      };
    }

    // 检查是否已有writer实例
    if (writerInstances.has(svgId)) {
      const writer = writerInstances.get(svgId);
      if (writer && typeof writer.setCharacter === 'function') {
        // 如果使用了米字格，需要重新创建writer实例
        if (_opt.useGridBackground) {
          safelyClearContainer(container);
          const targetSvgId = createGridBackground(container, fontSize, fontSize, _opt.gridColor);
          const newWriter = HanziWriter.create(targetSvgId, str, writerOptions);
          writerInstances.set(svgId, newWriter);

          if (_opt.delayBetweenLoops) {
            newWriter.loopCharacterAnimation();
          }

          return newWriter;
        }

        // 没有使用米字格时，直接更新字符
        writer.setCharacter(str);
        return writer;
      }
    } else {
      safelyClearContainer(container);

      let targetSvgId = svgId;
      // 如果需要米字格，先创建背景
      if (_opt.useGridBackground) {
        targetSvgId = createGridBackground(container, fontSize, fontSize, _opt.gridColor);
      }

      const writer = HanziWriter.create(targetSvgId, str, writerOptions);
      writerInstances.set(svgId, writer);

      if (_opt.delayBetweenLoops) {
        writer.loopCharacterAnimation();
      }

      return writer;
    }

  } catch (error) {
    console.error('渲染汉字出错:', error);
    
    // 降级处理：显示纯文字
    const fallbackFontSize = _opt.fontSize || _opt.width || 100;
    
    container.innerHTML = `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${fallbackFontSize}px;
      height: ${fallbackFontSize}px;
      font-size: ${Math.floor(fallbackFontSize * 0.8)}px;
      color: ${_opt.strokeColor || '#333'};
      font-family: serif;
      border: ${_opt.useGridBackground ? '1px solid ' + (_opt.gridColor || '#DDD') : 'none'};
    ">${str}</div>`;
    
    return null;
  }
};

/**
 * 清理HanziWriter资源
 * @param svgId 容器ID
 */
export const cleanupHanziWriter = (svgId: string) => {
  try {
    // 从map中删除实例引用
    if (writerInstances.has(svgId)) {
      const writer = writerInstances.get(svgId);
      // 如果writer有destroy方法，调用它
      if (writer && typeof writer.destroy === 'function') {
        writer.destroy();
      }
      writerInstances.delete(svgId);
    }

    // 获取容器并清空
    const container = document.getElementById(svgId);
    if (container) {
      safelyClearContainer(container);
    }
  } catch (error) {
    console.error('清理HanziWriter资源出错:', error);
  }
};

/**
 * 预加载本地汉字数据到缓存
 * @param characters 要预加载的汉字数组
 */
export const preloadLocalCharacterData = (characters: string[]) => {
  try {
    characters.forEach(char => {
      if (!localCharacterDataCache.has(char)) {
        try {
          // 使用require方式预加载本地字库数据
          const characterData = require(`hanzi-writer-data/${char}`);
          localCharacterDataCache.set(char, characterData);
        } catch (error) {
          // 预加载失败时静默处理
        }
      }
    });
  } catch (error) {
    // 预加载失败时静默处理
  }
};

// 默认导出
export default {
  renderHanziInContainer,
  cleanupHanziWriter,
  preloadLocalCharacterData,
  safelyClearContainer
};