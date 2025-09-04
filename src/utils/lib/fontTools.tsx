import HanziWriter from 'hanzi-writer';

const strokeColors = ['#333', '#555', '#777', '#999', '#bbb'];
const radicalColor = '#ff0000';

const defaultOptions = {
  width: 100,
  height: 100,
  strokeWidth: 5,
  strokeColor: strokeColors[1],
  useGridBackground: false,  // 新增：默认不使用米字格背景
  gridColor: '#DDD'  // 新增：米字格线条颜色
};

// 存储已创建的writer实例引用
const writerInstances = new Map<string, any>();

/**
 * 安全地清空DOM容器内容
 * @param container 要清空的DOM容器元素
 * @returns 是否成功清空
 */
export const safelyClearContainer = (container: HTMLElement | null): boolean => {
  if (!container) {
    console.error('Container not found or is null');
    return false;
  }

  try {
    // 安全地清空容器
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    return true;
  } catch (error) {
    console.error('Error clearing container:', error);
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
  // 生成唯一的SVG ID
  const svgId = `character-svg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // 创建一个带米字格背景的SVG元素
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', svgId);
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // 添加米字格背景
  // 水平线
  const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  horizontalLine.setAttribute('x1', '0');
  horizontalLine.setAttribute('y1', (height / 2).toString());
  horizontalLine.setAttribute('x2', width.toString());
  horizontalLine.setAttribute('y2', (height / 2).toString());
  horizontalLine.setAttribute('stroke', gridColor);

  // 垂直线
  const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  verticalLine.setAttribute('x1', (width / 2).toString());
  verticalLine.setAttribute('y1', '0');
  verticalLine.setAttribute('x2', (width / 2).toString());
  verticalLine.setAttribute('y2', height.toString());
  verticalLine.setAttribute('stroke', gridColor);

  // 对角线1
  const diagonalLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonalLine1.setAttribute('x1', '0');
  diagonalLine1.setAttribute('y1', '0');
  diagonalLine1.setAttribute('x2', width.toString());
  diagonalLine1.setAttribute('y2', height.toString());
  diagonalLine1.setAttribute('stroke', gridColor);

  // 对角线2
  const diagonalLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  diagonalLine2.setAttribute('x1', width.toString());
  diagonalLine2.setAttribute('y1', '0');
  diagonalLine2.setAttribute('x2', '0');
  diagonalLine2.setAttribute('y2', height.toString());
  diagonalLine2.setAttribute('stroke', gridColor);

  // 将所有线条添加到SVG中
  svg.appendChild(horizontalLine);
  svg.appendChild(verticalLine);
  svg.appendChild(diagonalLine1);
  svg.appendChild(diagonalLine2);

  // 将SVG添加到容器中
  container.appendChild(svg);

  return svgId;
};

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
    console.error(`Container with id "${svgId}" not found`);
    return;
  }

  try {
    // 检查是否已有writer实例
    if (writerInstances.has(svgId)) {
      const writer = writerInstances.get(svgId);
      if (writer && typeof writer.setCharacter === 'function') {
        // 如果使用了米字格且options中指定了useGridBackground
        // 则需要重新创建整个writer实例，确保米字格和字符正确关联
        if (_opt.useGridBackground) {
          // step1: 清空容器
          safelyClearContainer(container);

          // step2: 创建米字格背景
          const targetSvgId = createGridBackground(container, _opt.width, _opt.height, _opt.gridColor);

          // step3: 重新创建writer实例，使用新创建的SVG元素
          const newWriter = HanziWriter.create(targetSvgId, str, _opt);

          // step4: 更新实例引用
          writerInstances.set(svgId, newWriter);

          if (_opt.delayBetweenLoops) {
            newWriter.loopCharacterAnimation();
          }

          // step5: 返回新的writer实例
          return newWriter;
        }

        // step6: 没有使用米字格时，直接更新字符
        writer.setCharacter(str);
        return writer;
      }
    } else {
      // step1: 清空容器
      safelyClearContainer(container);

      let targetSvgId = svgId; // 默认使用传入的容器ID作为目标SVG ID

      // step2: 如果需要米字格，先创建米字格背景并获取其唯一ID
      if (_opt.useGridBackground) {
        targetSvgId = createGridBackground(container, _opt.width, _opt.height, _opt.gridColor);
      }

      // step3: 创建新的writer实例，使用目标SVG ID
      const writer = HanziWriter.create(targetSvgId, str, _opt);

      // step4: 保存实例引用
      writerInstances.set(svgId, writer);
      if (_opt.delayBetweenLoops) {
        writer.loopCharacterAnimation();
      }
      // step5: 返回新的writer实例
      return writer;
      // 注意：hanzi-writer 3.7.2版本可能没有draw方法，create后会自动渲染
    }



  } catch (error) {
    console.error('Error rendering character:', error);
  }
};

// 提供一个清理函数，在组件卸载时调用
// 符合React规范，在组件卸载时清理资源
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
    console.error('Error cleaning up HanziWriter resources:', error);
  }
};