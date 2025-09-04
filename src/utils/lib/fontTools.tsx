import HanziWriter from 'hanzi-writer';

const strokeColors = ['#333', '#555', '#777', '#999', '#bbb'];
const radicalColor = '#ff0000';

const defaultOptions = {
  width: 100,
  height: 100,
  strokeWidth: 5,
  strokeColor: strokeColors[1],
//   delayBetweenLoops: 3000
};

// 存储已创建的writer实例引用
const writerInstances = new Map<string, any>();

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
      // 对于hanzi-writer 3.7.2版本，直接使用setCharacter方法更新字符
      const writer = writerInstances.get(svgId);
      if (writer && typeof writer.setCharacter === 'function') {
        writer.setCharacter(str);
        return;
      }
    }
    
    // 清空容器（使用更安全的方式）
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // 创建新的writer实例
    const writer = HanziWriter.create(svgId, str, _opt);
    
    // 保存实例引用
    writerInstances.set(svgId, writer);
    if(_opt.delayBetweenLoops){
         writer.loopCharacterAnimation();
    }
   
    return writer;
    // 注意：hanzi-writer 3.7.2版本可能没有draw方法，create后会自动渲染
    
  } catch (error) {
    console.error('Error rendering character:', error);
  }
};

// 提供一个清理函数，在组件卸载时调用
export const cleanupHanziWriter = (svgId: string) => {
  if (writerInstances.has(svgId)) {
    // 对于hanzi-writer 3.7.2版本，我们直接从map中删除引用，DOM清理由React组件处理
    writerInstances.delete(svgId);
  }
};