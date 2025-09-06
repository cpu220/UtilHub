import HanziWriter from 'hanzi-writer';

const strokeColors = ['#333', '#555', '#777', '#999', '#bbb'];
const radicalColor = '#ff0000';

const defaultOptions = {
  width: 100,
  height: 100,
  padding: 5,
  strokeWidth: 5,
  strokeColor: strokeColors[1],
  useGridBackground: false,
  gridColor: '#DDD',
  useLocalData: true // 控制是否使用本地字库
};

// 存储已创建的writer实例引用
const writerInstances = new Map<string, any>();

// 本地字库数据缓存
const localCharacterDataCache = new Map<string, any>();

/**
 * 安全地清空DOM容器内容
 * @param container 要清空的DOM容器元素
 * @returns 是否成功清空
 */
export const safelyClearContainer = (container: HTMLElement | null): boolean => {
  if (!container) {
    console.error('容器未找到或为空');
    return false;
  }

  try {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    return true;
  } catch (error) {
    console.error('清空容器出错:', error);
    return false;
  }
};

/**
 * 创建米字格背景
 * @param container 目标容器元素
 * @param width 宽度
 * @param height 高度
 * @param gridColor 米字格颜色
 * @returns 创建的SVG元素的唯一ID
 */
const createGridBackground = (container: HTMLElement, width: number, height: number, gridColor: string): string => {
  const svgId = `character-svg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', svgId);
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('border', 'solid 1px #ddd');







  // 添加米字格线条
  const addGridLine = (x1: string, y1: string, x2: string, y2: string) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', gridColor);
    svg.appendChild(line);
  };

  // 绘制米字格
  addGridLine('0', (height / 2).toString(), width.toString(), (height / 2).toString()); // 水平线
  addGridLine((width / 2).toString(), '0', (width / 2).toString(), height.toString()); // 垂直线
  addGridLine('0', '0', width.toString(), height.toString()); // 对角线1
  addGridLine(width.toString(), '0', '0', height.toString()); // 对角线2


  // top
  // addGridLine('0', '0', width.toString(), '0') 
  // // right
  // addGridLine(width.toString(), '0', width.toString(), height.toString())
  // // bottom
  // addGridLine('0', height.toString(), width.toString(), height.toString())
  // // left
  // addGridLine('0', '0', '0', height.toString())

  container.appendChild(svg);
  return svgId;
};

/**
 * 加载本地汉字数据
 * @param character 要加载的汉字
 * @returns 汉字数据或null
 */
const loadLocalCharacterData = (character: string): any => {
  // 检查缓存
  if (localCharacterDataCache.has(character)) {
    return localCharacterDataCache.get(character);
  }

  try {
    // 使用require方式加载本地字库数据
    const characterData = require(`hanzi-writer-data/${character}`);
    // 缓存数据
    localCharacterDataCache.set(character, characterData);
    return characterData;
  } catch (error) {
    console.warn(`本地字库中未找到"${character}"，将使用CDN方式加载`);
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
    // 创建配置对象
    const writerOptions = { ..._opt };

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
          const targetSvgId = createGridBackground(container, _opt.width, _opt.height, _opt.gridColor);
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
        targetSvgId = createGridBackground(container, _opt.width, _opt.height, _opt.gridColor);
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
          console.warn(`预加载本地字库数据"${char}"失败，将在使用时通过CDN加载`);
        }
      }
    });
  } catch (error) {
    console.error('预加载本地字库数据出错:', error);
  }
};