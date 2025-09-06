
import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { ICharsheetConfig, IRenderOptions } from '../interface';

import { GridConfig, DefaultRenderOptions } from './const';
import styles from './index.less';
import { PrintButton, DirectGridRenderer, StyleConfigForm } from './Component';
import PreviewButton from './Component/previewButton';

import { LEVEL4_LIST } from '../const';



/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {

  const [fontList, setFontList] = useState<string>(LEVEL4_LIST);
  const [customConfig, setCustomConfig] = useState<{ config: ICharsheetConfig, renderOptions: IRenderOptions }>({
    config: { ...GridConfig },
    renderOptions: { ...DefaultRenderOptions }
  });

  const handleCreateFontList = () => {
    const fontList = generateRandomChineseCharsString(153);
    setFontList(fontList);
  }

  // 处理配置变化的回调函数
  const handleConfigChange = (newConfig: { config: ICharsheetConfig; renderOptions: IRenderOptions }) => {
    setCustomConfig(newConfig);
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
        fontList={fontList}
        renderOptions={customConfig.renderOptions}
        config={customConfig.config}
      />
      <PreviewButton
        elementId="grid-container"
        buttonType="link"
      />


    </div>
  );
}

export default CustomCharsheetPage;