
import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { ICharsheetConfig, IRenderOptions } from '../interface';

import { GridConfig, DefaultRenderOptions } from '../const';
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
    renderOptions: { ...DefaultRenderOptions }
  });

  const handleCreateFontList = () => {
    const randomFontList = generateRandomChineseCharsString(153);
    // 创建一个临时的字库对象用于随机字库
    setCurrentFontLibrary({
      name: '随机字库',
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
          defaultRenderOptions={DefaultRenderOptions}
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

      </div>


      <DirectGridRenderer
        fontList={currentFontLibrary.list}
        renderOptions={customConfig.renderOptions}
        config={customConfig.config}
      />
     
      
      <ImageConverter
        sourceElementId="page-grid-container"
        buttonType="link"
        buttonText="预览导出效果"
      />

    </div>
  );
}

export default CustomCharsheetPage;