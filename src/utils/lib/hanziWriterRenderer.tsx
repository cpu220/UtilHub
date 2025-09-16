/**
 * 基于 hanzi-writer 的汉字渲染工具
 * 提供统一的字体大小控制，与 cnchar-draw 保持一致
 */

import HanziWriter from 'hanzi-writer';
import React from 'react';
import { getBorderColor, getGridColor } from '@/pages/charsheet/const/colorManager';
import { StrokeDisplayConfig, StrokeJSXElement, StrokeDisplayResult, StrokeDataConfig, StrokeDataResult } from '@/pages/charsheet/interface';
import { STROKE_DEFAULT_CONFIG, STROKE_COLORS, STROKE_ERROR_MESSAGES, getStrokeSize, getArrowFontSize, HANZI_WRITER_DEFAULT_OPTIONS } from '@/pages/charsheet/const/font';

// 使用统一的默认配置选项
const defaultOptions = HANZI_WRITER_DEFAULT_OPTIONS;




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
 * 创建多色笔画SVG元素
 * 每个笔画使用不同的颜色
 * @param strokePaths 笔画路径数组
 * @param size SVG尺寸
 * @param colors 颜色数组
 * @returns SVG元素
 */
export const createMultiColorStrokeSVG = (strokePaths: string[], size: number, colors: readonly string[]): SVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
  // 添加统一的hanzi-writer标识类名
  svg.setAttribute('class', 'T-HZ');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  svg.style.width = `${size}px`;
  svg.style.height = `${size}px`;
  
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // 设置变换属性，使字符在指定尺寸下渲染
  const transformData = HanziWriter.getScalingTransform(size, size);
  group.setAttributeNS(null, 'transform', transformData.transform);
  svg.appendChild(group);
  
  // 为每个笔画设置不同的颜色
  strokePaths.forEach((strokePath: string, index: number) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', strokePath);
    
    // 如果颜色数组不够，超出的笔画使用默认颜色
    let strokeColor: string;
    if (index < colors.length) {
      // 在颜色数组范围内，使用对应颜色
      strokeColor = colors[index];
    } else {
      // 超出颜色数组范围，使用默认填充颜色
      strokeColor = STROKE_DEFAULT_CONFIG.FILL_COLOR;
    }
    
    path.style.fill = strokeColor;
    group.appendChild(path);
  });
  
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
  
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'grid-lines');
  
  const halfWidth = Math.round(width / 2) + 0.5;
  const halfHeight = Math.round(height / 2) + 0.5;
  const dashArray = useDashedLines ? '3,3' : undefined;
  
  // 边框矩形
  if (showBorder) {
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    border.setAttribute('x', '0');
    border.setAttribute('y', '0');
    border.setAttribute('width', width.toString());
    border.setAttribute('height', height.toString());
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', gridColor);
    border.setAttribute('stroke-width', (strokeWidth * 1.5).toString()); // 边框稍粗一些
    group.appendChild(border);
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
  group.appendChild(horizontalLine);
  
  // 垂直中线
  const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  verticalLine.setAttribute('x1', halfWidth.toString());
  verticalLine.setAttribute('y1', '0');
  verticalLine.setAttribute('x2', halfWidth.toString());
  verticalLine.setAttribute('y2', height.toString());
  verticalLine.setAttribute('stroke', gridColor);
  verticalLine.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) verticalLine.setAttribute('stroke-dasharray', dashArray);
  group.appendChild(verticalLine);
  
  // 对角线1（左上到右下）
  const diagonal1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonal1.setAttribute('x1', '0');
  diagonal1.setAttribute('y1', '0');
  diagonal1.setAttribute('x2', width.toString());
  diagonal1.setAttribute('y2', height.toString());
  diagonal1.setAttribute('stroke', gridColor);
  diagonal1.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) diagonal1.setAttribute('stroke-dasharray', dashArray);
  group.appendChild(diagonal1);
  
  // 对角线2（右上到左下）
  const diagonal2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonal2.setAttribute('x1', width.toString());
  diagonal2.setAttribute('y1', '0');
  diagonal2.setAttribute('x2', '0');
  diagonal2.setAttribute('y2', height.toString());
  diagonal2.setAttribute('stroke', gridColor);
  diagonal2.setAttribute('stroke-width', strokeWidth.toString());
  if (dashArray) diagonal2.setAttribute('stroke-dasharray', dashArray);
  group.appendChild(diagonal2);
  
  svg.appendChild(group);
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
    showBorder: true  
  });
  
  // 设置ID和样式（保持向后兼容）
  svg.setAttribute('id', svgId);
  svg.style.display = 'block';
  // svg.style.border = `1px solid ${gridColor}`;  
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
 * 生成笔画数据（通用API）
 * 纯数据生成，不涉及JSX，供模板组件使用
 * hanzi-writer的通用封装方法
 */
export const generateStrokeData = async (
  character: string,
  config: StrokeDataConfig = {}
): Promise<StrokeDataResult> => {
  // 使用动态计算的笔画大小，根据FONT_SCALE自动调整
  const dynamicStrokeSize = getStrokeSize();
  
  const {
    strokeSize = dynamicStrokeSize,
    colorMode = 'single',
    fillColor = STROKE_DEFAULT_CONFIG.FILL_COLOR,
    radicalColor,
    customColors,
    includeArrows = true,
    arrowChar = STROKE_DEFAULT_CONFIG.ARROW_CHAR
  } = config;

  if (!character) {
    return {
      character: '',
      strokeCount: 0,
      strokeSVGs: [],
      strokeColors: [],
      includeArrows,
      arrowChar,
      arrowFontSize: getArrowFontSize(strokeSize),
      hasError: true,
      errorMessage: '字符不能为空'
    };
  }

  try {
    const strokes = await getCharacterStrokeData(character);
    
    if (strokes.length === 0) {
      return {
        character,
        strokeCount: 0,
        strokeSVGs: [],
        strokeColors: [],
        includeArrows,
        arrowChar,
        arrowFontSize: getArrowFontSize(strokeSize),
        hasError: true,
        errorMessage: '暂无笔画数据'
      };
    }

    const strokeSVGs: string[] = [];
    const strokeColors: string[] = [];
    
    // 生成每个笔画的SVG数据
    for (let i = 0; i < strokes.length; i++) {
      const strokesPortion = strokes.slice(0, i + 1);
      
      // 根据颜色模式创建SVG
      let strokeSVG: SVGElement;
      
      if (colorMode === 'stroke') {
        // 每个笔画不同颜色模式：需要为每一笔设置不同颜色
        // 第1个SVG：第1笔用颜色a
        // 第2个SVG：第1笔用颜色a，第2笔用颜色b
        // 第3个SVG：第1笔用颜色a，第2笔用颜色b，第3笔用颜色c
        strokeSVG = createMultiColorStrokeSVG(strokesPortion, strokeSize, STROKE_COLORS);
        
        // 记录当前SVG包含的所有笔画颜色
         const currentStrokeColors = strokesPortion.map((_, index) => {
           if (index < STROKE_COLORS.length) {
             // 在颜色数组范围内，使用对应颜色
             return STROKE_COLORS[index];
           } else {
             // 超出颜色数组范围，使用默认填充颜色
             return STROKE_DEFAULT_CONFIG.FILL_COLOR;
           }
         });
        strokeColors.push(currentStrokeColors.join(','));
      } else {
        // 其他颜色模式：统一颜色
        let currentColor: string;
        switch (colorMode) {
          case 'radical':
            // TODO: 实现偏旁部首颜色逻辑，暂时使用默认颜色
            currentColor = radicalColor || fillColor;
            break;
          case 'custom':
            // 使用自定义颜色数组
            currentColor = customColors && customColors.length > 0 
              ? customColors[i % customColors.length] 
              : fillColor;
            break;
          case 'single':
          default:
            // 单一颜色模式
            currentColor = fillColor;
            break;
        }
        
        strokeColors.push(currentColor);
        
        // 创建单色笔画SVG
        strokeSVG = createStrokeSVG(strokesPortion, strokeSize, { 
          fillColor: currentColor
        });
      }
      
      strokeSVGs.push(strokeSVG.outerHTML);
    }
    
    return {
      character,
      strokeCount: strokes.length,
      strokeSVGs,
      strokeColors,
      includeArrows,
      arrowChar,
      arrowFontSize: getArrowFontSize(strokeSize),
      hasError: false
    };
  } catch (error) {
    console.warn(`生成笔画数据失败:`, error);
    return {
      character,
      strokeCount: 0,
      strokeSVGs: [],
      strokeColors: [],
      includeArrows,
      arrowChar,
      arrowFontSize: getArrowFontSize(strokeSize),
      hasError: true,
      errorMessage: '笔画加载失败'
    };
  }
};

/**
 * 在指定容器中渲染汉字的笔画进度
 * @param containerId 容器ID
 * @param character 汉字字符
 * @param strokeCount 要显示的笔画数量（1表示显示第1笔，2表示显示第1+2笔）
 * @param options 渲染选项
 */
export const renderStrokeProgressInContainer = async (
  containerId: string,
  character: string,
  strokeCount: number,
  options: any = {}
): Promise<void> => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`容器 ${containerId} 不存在`);
    return;
  }

  try {
    // 获取笔画数据
    const strokes = await getCharacterStrokeData(character);
    if (strokes.length === 0 || strokeCount <= 0) {
      // 如果没有笔画数据或笔画数量为0，渲染空的米字格
      createEmptyGridInContainer(containerId, options.width || 100, options.height || 100);
      return;
    }

    // 限制笔画数量不超过实际笔画数
    const actualStrokeCount = Math.min(strokeCount, strokes.length);
    const strokesPortion = strokes.slice(0, actualStrokeCount);

    // 清空容器
    safelyClearContainer(container);

    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', (options.width || 100).toString());
    svg.setAttribute('height', (options.height || 100).toString());
    svg.setAttribute('class', 'T-HZ stroke-progress');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // 添加米字格背景
    if (options.useGridBackground !== false) {
      addGridLinesToSVG(svg, options.width || 100, options.height || 100, options.gridColor);
    }

    // 创建笔画SVG并添加到容器
    const strokeSVG = createStrokeSVG(strokesPortion, options.width || 100, {
      fillColor: options.strokeColor || '#555'
    });

    // 将笔画路径添加到主SVG中
    const strokeGroup = strokeSVG.querySelector('g');
    if (strokeGroup) {
      svg.appendChild(strokeGroup.cloneNode(true));
    }

    container.appendChild(svg);
  } catch (error) {
    console.error(`渲染笔画进度失败:`, error);
    // 出错时渲染空的米字格
    createEmptyGridInContainer(containerId, options.width || 100, options.height || 100);
  }
};

export default {
  renderHanziInContainer,
  cleanupHanziWriter,
  preloadLocalCharacterData,
  safelyClearContainer,
  getCharacterStrokeData,
  createStrokeSVG,
  createMultiColorStrokeSVG,
  generateStrokeData,
  renderStrokeProgressInContainer
};