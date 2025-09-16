/**
 * 基于 hanzi-writer 的汉字渲染工具
 * 提供统一的字体大小控制，与 cnchar-draw 保持一致
 */

import HanziWriter from 'hanzi-writer';
import { getGridColor } from '@/pages/charsheet/const/colorManager';

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
 * 创建米字格SVG元素
 * @param width 宽度
 * @param height 高度
 * @param gridColor 网格颜色
 * @param options 额外选项
 * @returns SVG元素
 */
export const createGridSVG = (width: number, height: number, gridColor: string = getGridColor(), options: {
  strokeWidth?: number;
  useDashedLines?: boolean;
  showBorder?: boolean;
} = {}): SVGElement => {
  const {
    strokeWidth = Math.max(0.5, Math.min(1, width / 100)),
    useDashedLines = true,
    showBorder = true
  } = options;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  // 为网格SVG添加统一的T-HZ类名
  svg.setAttribute('class', 'T-HZ');
  
  addGridLinesToSVG(svg, width, height, gridColor, { strokeWidth, useDashedLines, showBorder });
  
  return svg;
};

/**
 * 向SVG元素添加米字格线条
 * @param svg SVG元素
 * @param width 宽度
 * @param height 高度
 * @param gridColor 网格颜色
 * @param options 选项
 */
export const addGridLinesToSVG = (svg: SVGElement, width: number, height: number, gridColor: string = getGridColor(), options: {
  strokeWidth?: number;
  useDashedLines?: boolean;
  showBorder?: boolean;
} = {}): void => {
  const {
    strokeWidth = Math.max(0.5, Math.min(1, width / 100)),
    useDashedLines = true,
    showBorder = true
  } = options;
  
  const halfWidth = Math.round(width / 2) + 0.5;
  const halfHeight = Math.round(height / 2) + 0.5;
  const dashArray = useDashedLines ? '3,3' : undefined;
  
  // 背景矩形（如果需要边框）
  if (showBorder) {
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0.5');
    background.setAttribute('y', '0.5');
    background.setAttribute('width', (width - 1).toString());
    background.setAttribute('height', (height - 1).toString());
    background.setAttribute('fill', 'white');
    background.setAttribute('stroke', gridColor);
    background.setAttribute('stroke-width', strokeWidth.toString());
    svg.appendChild(background);
  }
  
  // 水平中线
  const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  horizontalLine.setAttribute('x1', '0');
  horizontalLine.setAttribute('y1', halfHeight.toString());
  horizontalLine.setAttribute('x2', width.toString());
  horizontalLine.setAttribute('y2', halfHeight.toString());
  horizontalLine.setAttribute('stroke', gridColor);
  horizontalLine.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) horizontalLine.setAttribute('stroke-dasharray', dashArray);
  svg.appendChild(horizontalLine);
  
  // 垂直中线
  const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  verticalLine.setAttribute('x1', halfWidth.toString());
  verticalLine.setAttribute('y1', '0');
  verticalLine.setAttribute('x2', halfWidth.toString());
  verticalLine.setAttribute('y2', height.toString());
  verticalLine.setAttribute('stroke', gridColor);
  verticalLine.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) verticalLine.setAttribute('stroke-dasharray', dashArray);
  svg.appendChild(verticalLine);
  
  // 对角线1（左上到右下）
  const diagonal1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonal1.setAttribute('x1', '0');
  diagonal1.setAttribute('y1', '0');
  diagonal1.setAttribute('x2', width.toString());
  diagonal1.setAttribute('y2', height.toString());
  diagonal1.setAttribute('stroke', gridColor);
  diagonal1.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) diagonal1.setAttribute('stroke-dasharray', dashArray);
  svg.appendChild(diagonal1);
  
  // 对角线2（右上到左下）
  const diagonal2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonal2.setAttribute('x1', width.toString());
  diagonal2.setAttribute('y1', '0');
  diagonal2.setAttribute('x2', '0');
  diagonal2.setAttribute('y2', height.toString());
  diagonal2.setAttribute('stroke', gridColor);
  diagonal2.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) diagonal2.setAttribute('stroke-dasharray', dashArray);
  svg.appendChild(diagonal2);
};

/**
 * 创建空的米字格并添加到容器中
 * @param containerId 容器ID
 * @param width 宽度
 * @param height 高度
 * @param gridColor 网格颜色
 * @param options 选项
 */
export const createEmptyGridInContainer = (containerId: string, width: number, height: number, gridColor: string = getGridColor(), options: {
  strokeWidth?: number;
  useDashedLines?: boolean;
  showBorder?: boolean;
} = {}): void => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  const svg = createGridSVG(width, height, gridColor, options);
  container.appendChild(svg);
};

/**
 * 创建米字格背景（保持向后兼容）
 * 现在使用统一的createGridSVG函数实现
 * @param container 容器元素
 * @param width 宽度
 * @param height 高度
 * @param gridColor 网格颜色
 * @returns 新创建的SVG元素ID
 */
const createGridBackground = (container: HTMLElement, width: number, height: number, gridColor: string): string => {
  const svgId = `hanzi-grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 使用统一的createGridSVG函数创建SVG
  const svg = createGridSVG(width, height, gridColor, {
    strokeWidth: 1,
    useDashedLines: true,
    showBorder: false // 不使用内置边框，因为要设置CSS边框
  });
  
  // 设置ID和样式（保持向后兼容）
  svg.setAttribute('id', svgId);
  svg.style.display = 'block';
  svg.style.border = `1px solid ${gridColor}`;
  svg.style.boxSizing = 'border-box';
  
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
          
          // 为HanziWriter创建的SVG添加统一的T-HZ类名
          setTimeout(() => {
            const targetElement = document.getElementById(targetSvgId);
            if (targetElement) {
              const svgElement = targetElement.querySelector('svg');
              if (svgElement && !svgElement.classList.contains('T-HZ')) {
                svgElement.classList.add('T-HZ');
              }
            }
          }, 0);

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
      
      // 为HanziWriter创建的SVG添加统一的T-HZ类名
      setTimeout(() => {
        const targetElement = document.getElementById(targetSvgId);
        if (targetElement) {
          const svgElement = targetElement.querySelector('svg');
          if (svgElement && !svgElement.classList.contains('T-HZ')) {
            svgElement.classList.add('T-HZ');
          }
        }
      }, 0);

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
      border: ${_opt.useGridBackground ? '1px solid ' + (_opt.gridColor || getGridColor()) : 'none'};
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
/**
 * 获取汉字的笔画数据
 * @param character 汉字字符
 * @returns 笔画路径数组
 */
export const getCharacterStrokeData = async (character: string): Promise<string[]> => {
  try {
    if (!character || character.length === 0) {
      return [];
    }
    
    // 优先尝试本地数据
    const localData = loadLocalCharacterData(character);
    if (localData && localData.strokes) {
      console.log(`使用本地数据获取字符"${character}"的笔画数据`);
      return localData.strokes;
    }
    
    // 降级到 CDN 数据
    console.warn(`本地数据不可用，使用 CDN 获取字符"${character}"的笔画数据`);
    const charData = await HanziWriter.loadCharacterData(character);
    return charData?.strokes || [];
  } catch (error) {
    console.warn(`获取字符"${character}"的笔画数据失败:`, error);
    return [];
  }
};

/**
 * 创建单个笔画SVG元素
 * @param strokePaths 笔画路径数组
 * @param size SVG尺寸
 * @param options 配置选项
 * @returns SVG元素
 */
export const createStrokeSVG = (strokePaths: string[], size: number, options: {
  fillColor?: string;
  className?: string;
} = {}): SVGElement => {
  const { fillColor = '#555', className } = options;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
  // 添加统一的hanzi-writer标识类名
  const classes = ['T-HZ'];
  if (className) {
    classes.push(className);
  }
  svg.setAttribute('class', classes.join(' '));
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  svg.style.width = `${size}px`;
  svg.style.height = `${size}px`;
  
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // 设置变换属性，使字符在指定尺寸下渲染
  const transformData = HanziWriter.getScalingTransform(size, size);
  group.setAttributeNS(null, 'transform', transformData.transform);
  svg.appendChild(group);
  
  strokePaths.forEach((strokePath: string) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', strokePath);
    path.style.fill = fillColor;
    group.appendChild(path);
  });
  
  return svg;
};

/**
 * 创建笔画顺序显示容器
 * @param character 汉字字符
 * @param options 配置选项
 * @returns Promise<HTMLDivElement>
 */
/**
 * 创建笔画顺序数据（纯数据处理，不创建DOM）
 * @deprecated 请使用 componentUtils 中的 createStrokeDisplayJSX
 */
export const createStrokeOrderContainer = async (character: string, options: {
  strokeSize?: number;
  containerClassName?: string;
  arrowClassName?: string;
  strokeSvgClassName?: string;
  fontRatio?: number;
  fillColor?: string;
} = {}): Promise<HTMLDivElement> => {
  console.warn('createStrokeOrderContainer is deprecated. Please use createStrokeDisplayJSX from componentUtils instead.');
  
  // 为了向后兼容，创建一个临时的div元素
  const strokeOrderDiv = document.createElement('div');
  strokeOrderDiv.className = options.containerClassName || 'stroke-order-container';
  strokeOrderDiv.style.minHeight = `${(options.strokeSize || 30) + 4}px`;
  
  if (!character) {
    return strokeOrderDiv;
  }
  
  try {
    const strokes = await getCharacterStrokeData(character);
    
    if (strokes.length === 0) {
      strokeOrderDiv.innerHTML = `<span style="color: #999; font-size: ${Math.floor((options.strokeSize || 30) * 0.6)}px;">暂无笔画数据</span>`;
      return strokeOrderDiv;
    }
    
    // 创建笔画顺序显示：逐步累积的笔画SVG
    for (let i = 0; i < strokes.length; i++) {
      const strokesPortion = strokes.slice(0, i + 1);
      const strokeSVG = createStrokeSVG(strokesPortion, options.strokeSize || 30, { 
        fillColor: options.fillColor || '#555',
        className: options.strokeSvgClassName 
      });
      strokeOrderDiv.appendChild(strokeSVG);
      
      // 添加箭头分隔符（除了最后一个）
      if (i < strokes.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = options.arrowClassName || 'stroke-arrow';
        arrow.style.fontSize = `${Math.floor((options.strokeSize || 30) * 0.5)}px`;
        arrow.textContent = '→';
        strokeOrderDiv.appendChild(arrow);
      }
    }
  } catch (error) {
    console.warn(`创建笔画顺序显示失败:`, error);
    strokeOrderDiv.innerHTML = `<span style="color: #999; font-size: ${Math.floor((options.strokeSize || 30) * 0.6)}px;">笔画加载失败</span>`;
  }
  
  return strokeOrderDiv;
};

export default {
  renderHanziInContainer,
  cleanupHanziWriter,
  preloadLocalCharacterData,
  safelyClearContainer,
  getCharacterStrokeData,
  createStrokeSVG,
  createStrokeOrderContainer
};