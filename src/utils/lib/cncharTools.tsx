/**
 * 基于 cnchar-draw 的汉字渲染工具
 * 作为 hanzi-writer 的替代方案，提供统一的字体大小控制
 */

// @ts-ignore
import cnchar from 'cnchar';
// @ts-ignore
import draw from 'cnchar-draw';

// cnchar 初始化状态
let cncharInitialized = false;

/**
 * 延迟初始化 cnchar-draw
 * 只有在实际使用时才进行初始化，避免不必要的服务连接
 */
const initializeCnchar = () => {
  if (cncharInitialized || typeof window === 'undefined') {
    return;
  }
  
  cnchar.use(draw);
  cncharInitialized = true;
  
  // 配置 cnchar-data 本地化数据源（已解决CORS问题）
  try {
    // 设置本地资源基础路径，指向cnchar-data本地服务
    cnchar.setResourceBase('http://localhost:3002/');
    console.log('cnchar-data 本地化配置成功，使用本地服务: http://localhost:3002/');
    
    // 测试资源路径是否可访问
    fetch('http://localhost:3002/draw/一.json')
      .then(response => {
        if (response.ok) {
          console.log('cnchar-data 服务测试成功，资源可访问');
          return response.json();
        } else {
          console.error('cnchar-data 服务测试失败，状态码:', response.status);
        }
      })
      .then(data => {
        if (data) {
          console.log('cnchar-data 数据格式正确:', data);
        }
      })
      .catch(error => {
        console.warn('cnchar-data 服务连接失败，将使用在线资源:', error.message);
      });
  } catch (error) {
    console.warn('cnchar-data 本地化配置失败，将使用在线资源:', error);
  }
};

// 不再在模块加载时自动初始化

// 绘制模式类型
type DrawType = 'normal' | 'animation' | 'stroke' | 'test';

// cnchar-draw 配置选项接口
interface CncharDrawOptions {
  el?: string | HTMLElement;
  type?: DrawType;
  clear?: boolean;
  style?: {
    backgroundColor?: string;
    showOutline?: boolean;
    showCharacter?: boolean;
    currentColor?: string;
    length?: number;
    padding?: number;
    outlineColor?: string;
    strokeColor?: string;
    radicalColor?: string;
  };
  line?: {
    lineStraight?: boolean;
    lineCross?: boolean;
    lineWidth?: number;
    lineColor?: string;
    lineDash?: boolean;
    border?: boolean;
    borderWidth?: number;
    borderColor?: string;
    borderDash?: boolean;
  };
  animation?: {
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    delayBetweenLoops?: number;
    autoAnimate?: boolean;
    animateComplete?: (end?: boolean) => void;
    stepByStep?: boolean;
    loopAnimate?: boolean;
  };
  test?: {
    onTestStatus?: (args: any) => void;
  };
}

// 默认配置
const defaultCncharOptions: CncharDrawOptions = {
  type: 'normal',
  clear: true,
  style: {
    backgroundColor: '#fff',
    showOutline: false,
    showCharacter: true, // 默认显示汉字笔画
    currentColor: '#555',
    length: 100,
    padding: 5,
    outlineColor: '#DDD',
    strokeColor: '#333',
    radicalColor: '#ff0000'
  },
  line: {
    lineStraight: true,
    lineCross: true,
    lineWidth: 1,
    lineColor: '#DDD',
    lineDash: true,
    border: true,
    borderWidth: 1,
    borderColor: '#ccc',
    borderDash: false
  },
  animation: {
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 300,
    delayBetweenLoops: 2000,
    autoAnimate: false,
    loopAnimate: false
  }
};

// 存储 cnchar-draw 实例
const cncharInstances = new Map<string, any>();

/**
 * 安全清理容器内容
 */
const safelyClearContainer = (container: HTMLElement) => {
  try {
    container.innerHTML = '';
    container.style.position = '';
  } catch (error) {
    console.warn('清理容器失败:', error);
  }
};

/**
 * 将 hanzi-writer 风格的选项转换为 cnchar-draw 选项
 * 确保字体大小的一致性
 */
const convertHanziWriterOptions = (hanziWriterOptions: any = {}): CncharDrawOptions => {
  // 统一字体大小计算：直接使用 fontSize 参数
  const fontSize = hanziWriterOptions.fontSize || (hanziWriterOptions.width || 100);
  
  const cncharOptions: CncharDrawOptions = {
    ...defaultCncharOptions,
    type: 'normal',
    clear: false, // 我们手动清理容器
    style: {
      ...defaultCncharOptions.style,
      length: fontSize, // 直接使用 fontSize
      padding: hanziWriterOptions.padding || 5,
      strokeColor: hanziWriterOptions.strokeColor || '#333',
      radicalColor: hanziWriterOptions.radicalColor || '#ff0000',
      showOutline: false, // 不显示轮廓，显示实际笔画
      showCharacter: true, // 确保显示汉字笔画
      outlineColor: hanziWriterOptions.outlineColor || hanziWriterOptions.gridColor || '#DDD'
    }
  };
  
  // 处理米字格背景
  if (hanziWriterOptions.useGridBackground) {
    cncharOptions.line = {
      ...defaultCncharOptions.line,
      lineStraight: true,
      lineCross: true,
      lineColor: hanziWriterOptions.gridColor || '#DDD',
      lineWidth: 1,
      lineDash: true,
      border: true,
      borderColor: hanziWriterOptions.gridColor || '#DDD',
      borderWidth: 1
    };
  } else {
    // 不显示米字格
    cncharOptions.line = {
      lineStraight: false,
      lineCross: false,
      border: false
    };
  }
  
  // 处理动画选项
  if (hanziWriterOptions.delayBetweenLoops) {
    cncharOptions.animation = {
      ...defaultCncharOptions.animation,
      delayBetweenLoops: hanziWriterOptions.delayBetweenLoops,
      loopAnimate: true,
      autoAnimate: true
    };
  }
  
  return cncharOptions;
};

/**
 * 使用 cnchar-draw 在指定容器中渲染汉字
 * @param containerId 容器ID
 * @param character 要渲染的汉字
 * @param options 兼容 hanzi-writer 的配置选项
 * @returns cnchar-draw 实例
 */
export const renderHanziWithCnchar = (containerId: string, character: string, options: any = {}) => {
  // 延迟初始化 cnchar-draw
  initializeCnchar();
  
  // 字符验证
  if (!character || character.length === 0) {
    console.warn('字符为空，无法渲染');
    return;
  }
  
  // 只取第一个字符
  const char = character.length > 1 ? character[0] : character;
  
  // 获取容器元素
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`未找到ID为"${containerId}"的容器`);
    return;
  }
  
  try {
    // 清理之前的实例
    if (cncharInstances.has(containerId)) {
      cncharInstances.delete(containerId);
    }
    
    // 清空容器
    safelyClearContainer(container);
    
    // 转换配置选项
    const drawOptions = convertHanziWriterOptions(options);
    drawOptions.el = container;
    
    console.log(`cnchar-draw 渲染配置:`, {
      character: char,
      fontSize: options.fontSize || options.width,
      renderSize: drawOptions.style?.length,
      useGridBackground: options.useGridBackground
    });
    
    // 使用 cnchar.draw 方法渲染汉字
    console.log('调用 cnchar.draw，字符:', char, '选项:', drawOptions);
    
    // 检查cnchar.draw是否可用
    if (typeof cnchar.draw !== 'function') {
      throw new Error('cnchar.draw 方法不可用，请确保正确导入 cnchar-draw');
    }
    
    const drawInstance = cnchar.draw(char, drawOptions);
    console.log('cnchar.draw 返回实例:', drawInstance);
    
    // 存储实例引用
    cncharInstances.set(containerId, drawInstance);
    
    return drawInstance;
    
  } catch (error) {
    console.error('使用 cnchar-draw 渲染汉字出错:', error);
    
    // 降级处理：显示纯文字
    const fallbackFontSize = options.fontSize || options.width || 100;
    
    container.innerHTML = `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${fallbackFontSize}px;
      height: ${fallbackFontSize}px;
      font-size: ${Math.floor(fallbackFontSize * 0.8)}px;
      color: ${options.strokeColor || '#333'};
      font-family: serif;
      border: ${options.useGridBackground ? '1px solid #DDD' : 'none'};
    ">${char}</div>`;
    
    return null;
  }
};

/**
 * 兼容 hanzi-writer 的 renderHanziInContainer 方法
 * @param svgId 容器ID
 * @param character 要渲染的汉字
 * @param options 配置选项
 * @returns cnchar-draw 实例
 */
export const renderHanziInContainer = (svgId: string, character: string, options?: any) => {
  return renderHanziWithCnchar(svgId, character, options);
};

/**
 * 清理 cnchar-draw 资源
 * @param containerId 容器ID
 */
export const cleanupCncharDraw = (containerId: string) => {
  try {
    // 从map中删除实例引用
    if (cncharInstances.has(containerId)) {
      cncharInstances.delete(containerId);
    }
    
    // 获取容器并清空
    const container = document.getElementById(containerId);
    if (container) {
      safelyClearContainer(container);
    }
  } catch (error) {
    console.error('清理 cnchar-draw 资源出错:', error);
  }
};

/**
 * 兼容 hanzi-writer 的清理方法
 * @param svgId 容器ID
 */
export const cleanupHanziWriter = (svgId: string) => {
  cleanupCncharDraw(svgId);
};

/**
 * 预加载汉字数据（cnchar-draw 支持本地化数据）
 * @param characters 要预加载的汉字数组
 */
export const preloadLocalCharacterData = (characters: string[]) => {
  try {
    // cnchar-draw 支持本地化数据，可以预加载常用字符
    console.log(`cnchar-draw 准备预加载 ${characters.length} 个字符`);
    
    // 预加载字符数据（如果配置了 cnchar-data）
    characters.forEach(char => {
      try {
        // 触发字符数据加载
        cnchar.draw(char, {
          el: document.createElement('div'),
          type: 'normal',
          style: { length: 1 } // 最小尺寸，仅用于预加载
        });
      } catch (error) {
        console.warn(`预加载字符 "${char}" 失败:`, error);
      }
    });
    
    console.log(`cnchar-draw 字符预加载完成`);
  } catch (error) {
    console.error('预加载汉字数据出错:', error);
  }
};

// 导出 cnchar 实例以供高级用法
export { cnchar };

// 默认导出兼容对象
export default {
  renderHanziInContainer,
  cleanupHanziWriter,
  preloadLocalCharacterData,
  renderHanziWithCnchar,
  cleanupCncharDraw,
  cnchar
};