
import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { ICharsheetConfig, IRenderOptions } from '../interface';

import { GridConfig, StrokeRenderOptions } from '../const';
import styles from './index.less';
import { PrintButton, DirectGridRenderer, StyleConfigForm, ImageConverter } from './Component';

import { FONT_LIBRARY } from '../const';
import { IFontLibrary } from '../interface';



/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {
 
  // 获取默认选中的字库
  const getDefaultFontLibrary = () => FONT_LIBRARY.find(lib => lib.select) || FONT_LIBRARY[0];
  
  const [currentFontLibrary, setCurrentFontLibrary] = useState<IFontLibrary>(getDefaultFontLibrary());
  const [customConfig, setCustomConfig] = useState<{ config: ICharsheetConfig, renderOptions: IRenderOptions }>({
    config: { ...GridConfig },
    renderOptions: { ...StrokeRenderOptions }
  });

  const handleCreateFontList = () => {
    const randomFontList = generateRandomChineseCharsString(153);
    // 创建一个临时的字库对象用于随机字库
    setCurrentFontLibrary({
      name: '随机常用字',
      list: randomFontList
    });
  }

  // 处理配置变化的回调函数
  const handleConfigChange = (newConfig: { config: ICharsheetConfig; renderOptions: IRenderOptions }) => {
    setCustomConfig(newConfig);
  };

  // 处理字库选择变化的回调函数
  const handleFontLibraryChange = (fontLibrary: IFontLibrary) => {
    setCurrentFontLibrary(fontLibrary);
  };





  // 打印选项配置
  const printOptions = {
    onBeforePrint: () => {
      message.info('正在准备打印内容...');
    },
    onAfterPrint: () => {
      message.success('打印操作完成');
    }
  };



  return (
    <div style={{ padding: '24px' }}>
      <div className={styles['button-container']}>
        <StyleConfigForm
          defaultRenderOptions={StrokeRenderOptions}
          defaultConfig={GridConfig}
          onConfigChange={handleConfigChange}
          onFontLibraryChange={handleFontLibraryChange}
        />
        <Button type="link" onClick={handleCreateFontList}>随机字库</Button>

        <PrintButton
          elementId="grid-container"
          printOptions={printOptions}
          buttonType="link"
          buttonText="打印"
        />
        <ImageConverter
        sourceElementId="page-grid-container"
        buttonType="link"
        buttonText="预览导出效果"
        previewVisible={true}
        fontLibraryName={currentFontLibrary.name}
      />

      </div>


      <DirectGridRenderer
        fontList={currentFontLibrary.list}
        renderOptions={customConfig.renderOptions}
        config={customConfig.config}
      />
     
     <div id="font-test-content" style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
       <h3>字体测试区域</h3>
       
       <div style={{ marginBottom: '20px' }}>
         <h4>青鸟华光简行楷测试：</h4>
         <div style={{ 
           fontFamily: '青鸟华光简行楷, cursive', 
           fontSize: '24px', 
           padding: '10px', 
           border: '1px solid #ddd',
           backgroundColor: '#f9f9f9'
         }}>
           青鸟华光简行楷字体测试：春江潮水连海平，海上明月共潮生。
         </div>
       </div>
       
       <div style={{ marginBottom: '20px' }}>
         <h4>瘦金体测试：</h4>
         <div style={{ 
           fontFamily: '瘦金体, serif', 
           fontSize: '24px', 
           padding: '10px', 
           border: '1px solid #ddd',
           backgroundColor: '#f9f9f9'
         }}>
           瘦金体字体测试：滟滟随波千万里，何处春江无月明。
         </div>
       </div>
       
       <div>
         <h4>系统默认字体对比：</h4>
         <div style={{ 
           fontFamily: 'serif', 
           fontSize: '24px', 
           padding: '10px', 
           border: '1px solid #ddd',
           backgroundColor: '#f0f0f0'
         }}>
           系统默认字体：江流宛转绕芳甸，月照花林皆似霰。
         </div>
       </div>
     </div>
      
      

    </div>
  );
}

export default CustomCharsheetPage;