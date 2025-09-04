import HanziWriter from 'hanzi-writer';

/**
 * 将汉字转换为SVG字符串
 * @param character 要转换的汉字
 * @param options 配置选项
 * @returns SVG字符串
 */
export async function hanziToSvg(
  character: string,
  options: { width?: number; height?: number; strokeColors?: string[]; radicalColor?: string } = {}
): Promise<string> {
  // 使用原始console对象避免App.tsx中的重写影响调试
  const originalConsole = window.console;

  originalConsole.log('hanziToSvg函数被调用，字符:', character);
  originalConsole.log('选项:', JSON.stringify(options));

  if (character.length !== 1) {
    originalConsole.error('输入不是单个汉字:', character);
    throw new Error('请输入单个汉字');
  }

  try {
    // 获取配置选项
    const width = options.width || 100;
    const height = options.height || 100;
    
    // 创建临时DOM元素
    const tempDiv = document.createElement('div');
    // 隐藏临时容器，避免在页面左上角显示
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = `${width}px`;
    tempDiv.style.height = `${height}px`;
    tempDiv.style.visibility = 'hidden';
    document.body.appendChild(tempDiv);
    originalConsole.log('临时DOM元素已添加到document.body');
    const padding = 20;
    const strokeColors = options.strokeColors || ['#333', '#555', '#777', '#999', '#bbb'];
    const radicalColor = options.radicalColor || '#ff0000';

    try {
      // 创建HanziWriter实例
      const writer = HanziWriter.create(tempDiv, character, {
        width,
        height,
        padding,
        strokeColor: strokeColors[0], // 默认颜色
        radicalColor,
        showOutline: true,  // 显示轮廓以便调试
        // drawingAnimationDuration: 1000,  // 动画慢一点以便观察
        strokeWidth: 5  // 笔画粗一点以便观察
      });

      originalConsole.log('HanziWriter实例已创建');

      // 检查writer对象上有哪些方法
      originalConsole.log('HanziWriter实例方法:', Object.keys(writer || {}));

      // 尝试直接获取SVG内容而不使用write方法
      // 等待一点时间确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 获取SVG元素
      const svgElement = tempDiv.querySelector('svg') as SVGElement;
      if (!svgElement) {
        // 如果没有找到SVG元素，尝试创建一个简单的SVG
        originalConsole.log('没有找到SVG元素，尝试创建简单SVG');
        
        // 创建一个简单的SVG包含汉字
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width.toString());
        svg.setAttribute('height', height.toString());
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // 计算合适的字体大小，确保汉字在容器中不会变形
        const fontSize = Math.min(width * 0.8, height * 0.8);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (width/2).toString());
        text.setAttribute('y', (height/2).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', fontSize.toString());
        text.setAttribute('fill', strokeColors[0]);
        // 添加字体样式，确保汉字显示清晰
        text.setAttribute('font-family', 'SimSun, STSong, "STSongti-SC-Regular", "AR PL SungtiL GB", serif');
        text.textContent = character;
        
        svg.appendChild(text);
        
        // 将创建的SVG添加到临时div中
        tempDiv.appendChild(svg);
        
        // 序列化SVG
        const svgString = new XMLSerializer().serializeToString(svg);
        originalConsole.log('已创建简单SVG，内容前50个字符:', svgString.substring(0, 50));
        return svgString;
      }

      // 序列化找到的SVG
      const svgString = new XMLSerializer().serializeToString(svgElement);
      originalConsole.log('SVG内容已获取，长度:', svgString.length);
      originalConsole.log('SVG内容前50个字符:', svgString.substring(0, 50));

      return svgString;
    } catch (error) {
      originalConsole.error('HanziWriter处理失败:', error);
      // 如果出错，创建一个简单的SVG作为备选
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // 计算合适的字体大小，确保汉字在容器中不会变形
      const fontSize = Math.min(width * 0.8, height * 0.8);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (width/2).toString());
      text.setAttribute('y', (height/2).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', fontSize.toString());
      text.setAttribute('fill', strokeColors[0]);
      // 添加字体样式，确保汉字显示清晰
      text.setAttribute('font-family', 'SimSun, STSong, "STSongti-SC-Regular", "AR PL SungtiL GB", serif');
      text.textContent = character;
      
      svg.appendChild(text);
      
      const svgString = new XMLSerializer().serializeToString(svg);
      originalConsole.log('出错时已创建简单SVG，内容前50个字符:', svgString.substring(0, 50));
      return svgString;
    } finally {
      // 延迟移除临时元素，以便我们可以观察渲染结果
      setTimeout(() => {
        document.body.removeChild(tempDiv);
        originalConsole.log('临时DOM元素已从document.body移除');
      }, 3000);
    }
  } catch (error) {
    originalConsole.error('生成SVG失败:', error);
    throw new Error(`无法生成汉字${character}的SVG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function svgToImageUrl(svgString: string): string {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

/**
 * 直接在指定容器中渲染汉字SVG
 * @param container 目标DOM容器
 * @param character 要渲染的汉字
 * @param options 配置选项
 * @returns Promise<SVGElement> 返回生成的SVG元素
 */
export async function renderHanziInContainer(
  container: HTMLElement,
  character: string,
  options: { width?: number; height?: number; strokeColors?: string[]; radicalColor?: string } = {}
): Promise<SVGElement> {
  const originalConsole = window.console;
  
  originalConsole.log('renderHanziInContainer函数被调用，字符:', character);
  
  if (character.length !== 1) {
    originalConsole.error('输入不是单个汉字:', character);
    throw new Error('请输入单个汉字');
  }
  
  try {
    // 获取配置选项
    const width = options.width || 100;
    const height = options.height || 100;
    const padding = 20;
    const strokeColors = options.strokeColors || ['#333', '#555', '#777', '#999', '#bbb'];
    const radicalColor = options.radicalColor || '#ff0000';
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建一个带米字格背景的SVG元素
    const svgId = `character-svg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', svgId);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // 添加米字格背景
    // 水平线
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', '0');
    horizontalLine.setAttribute('y1', (height/2).toString());
    horizontalLine.setAttribute('x2', width.toString());
    horizontalLine.setAttribute('y2', (height/2).toString());
    horizontalLine.setAttribute('stroke', '#DDD');
    
    // 垂直线
    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', (width/2).toString());
    verticalLine.setAttribute('y1', '0');
    verticalLine.setAttribute('x2', (width/2).toString());
    verticalLine.setAttribute('y2', height.toString());
    verticalLine.setAttribute('stroke', '#DDD');
    
    // 对角线1
    const diagonalLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagonalLine1.setAttribute('x1', '0');
    diagonalLine1.setAttribute('y1', '0');
    diagonalLine1.setAttribute('x2', width.toString());
    diagonalLine1.setAttribute('y2', height.toString());
    diagonalLine1.setAttribute('stroke', '#DDD');
    
    // 对角线2
    const diagonalLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagonalLine2.setAttribute('x1', width.toString());
    diagonalLine2.setAttribute('y1', '0');
    diagonalLine2.setAttribute('x2', '0');
    diagonalLine2.setAttribute('y2', height.toString());
    diagonalLine2.setAttribute('stroke', '#DDD');
    
    // 将所有线条添加到SVG中
    svg.appendChild(horizontalLine);
    svg.appendChild(verticalLine);
    svg.appendChild(diagonalLine1);
    svg.appendChild(diagonalLine2);
    
    // 将SVG添加到容器中
    container.appendChild(svg);
    
    // 在带有米字格背景的SVG中创建HanziWriter实例
    HanziWriter.create(svgId, character, {
      width,
      height,
      padding,
      strokeColor: strokeColors[0],
      radicalColor,
      showOutline: true,
    //   drawingAnimationDuration: 1000,
      strokeWidth: 5
    });
    
    originalConsole.log('容器中已创建HanziWriter实例');
    
    // 等待一点时间确保渲染完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 获取生成的SVG元素
    const svgElement = container.querySelector('svg') as SVGElement;
    
    if (!svgElement) {
      originalConsole.log('容器中未找到SVG元素，创建简单SVG');
      // 如果没有找到SVG元素，创建一个简单的SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // 计算合适的字体大小
      const fontSize = Math.min(width * 0.8, height * 0.8);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (width/2).toString());
      text.setAttribute('y', (height/2).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', fontSize.toString());
      text.setAttribute('fill', strokeColors[0]);
      text.setAttribute('font-family', 'SimSun, STSong, "STSongti-SC-Regular", "AR PL SungtiL GB", serif');
      text.textContent = character;
      
      svg.appendChild(text);
      container.appendChild(svg);
      return svg;
    }
    
    return svgElement;
  } catch (error) {
    originalConsole.error('在容器中渲染汉字失败:', error);
    // 创建一个简单的SVG作为备选
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = options.width || 100;
    const height = options.height || 100;
    const fontSize = Math.min(width * 0.8, height * 0.8);
    const strokeColors = options.strokeColors || ['#333'];
    
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (width/2).toString());
    text.setAttribute('y', (height/2).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', fontSize.toString());
    text.setAttribute('fill', strokeColors[0]);
    text.setAttribute('font-family', 'SimSun, STSong, "STSongti-SC-Regular", "AR PL SungtiL GB", serif');
    text.textContent = character;
    
    svg.appendChild(text);
    container.innerHTML = '';
    container.appendChild(svg);
    return svg;
  }
}