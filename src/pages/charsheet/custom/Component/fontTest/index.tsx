/**
 * 字体渲染测试组件
 * 用于验证字体渲染功能是否可行
 */

import React, { useEffect } from 'react';
import { Button, Space } from 'antd';
import { FontRenderer } from '@/utils';

const FontTest: React.FC = () => {
  
  // 测试字体渲染
  const testFontRendering = (fontFamily: string, testId: string) => {
    const options = {
      width: 100,
      height: 100,
      renderMode: 'font' as const,
      fontFamily: fontFamily,
      fontSize: 80,
      useGridBackground: true,
      gridColor: '#DDD',
      strokeWidth: 3,
      strokeColor: '#000',
      textColor: '#000',
      showOutline: false
    };
    
    FontRenderer.renderCharacterWithFont(testId, '测', options);
  };
  
  useEffect(() => {
    // 页面加载时自动测试
    testFontRendering('"SimHei", "Heiti SC", "Microsoft YaHei", sans-serif', 'font-test-1');
  }, []);
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>字体渲染测试</h3>
      
      <Space direction="vertical" size="large">
        <div>
          <h4>黑体测试：</h4>
          <div id="font-test-1" style={{ border: '1px solid #ccc', display: 'inline-block' }}></div>
          <Button 
            onClick={() => testFontRendering('"SimHei", "Heiti SC", "Microsoft YaHei", sans-serif', 'font-test-1')}
            style={{ marginLeft: '10px' }}
          >
            重新渲染黑体
          </Button>
        </div>
        
        <div>
          <h4>宋体测试：</h4>
          <div id="font-test-2" style={{ border: '1px solid #ccc', display: 'inline-block' }}></div>
          <Button 
            onClick={() => testFontRendering('"SimSun", "Songti SC", serif', 'font-test-2')}
            style={{ marginLeft: '10px' }}
          >
            渲染宋体
          </Button>
        </div>
        
        <div>
          <h4>楷体测试：</h4>
          <div id="font-test-3" style={{ border: '1px solid #ccc', display: 'inline-block' }}></div>
          <Button 
            onClick={() => testFontRendering('"KaiTi", "Kaiti SC", cursive', 'font-test-3')}
            style={{ marginLeft: '10px' }}
          >
            渲染楷体
          </Button>
        </div>
        
        <div>
          <h4>仿宋测试：</h4>
          <div id="font-test-4" style={{ border: '1px solid #ccc', display: 'inline-block' }}></div>
          <Button 
            onClick={() => testFontRendering('"FangSong", "STFangsong", serif', 'font-test-4')}
            style={{ marginLeft: '10px' }}
          >
            渲染仿宋
          </Button>
        </div>
      </Space>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h4>说明：</h4>
        <p>这个测试组件用于验证字体渲染功能是否正常工作。</p>
        <p>如果能看到不同字体的"测"字，说明技术方案是可行的。</p>
        <p>如果所有字体看起来都一样，可能是系统不支持这些字体。</p>
      </div>
    </div>
  );
};

export default FontTest;