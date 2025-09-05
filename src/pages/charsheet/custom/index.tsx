
import React, { useEffect, useState } from 'react';
import { Form, message, Row, Col, Input, Button, App } from 'antd';
import type { FormProps } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions } from '../interface';

import { GridConfig, DefaultRenderOptions } from './const';
import styles from './index.less';
import { PrintButton, DirectGridRenderer } from './Component';

import { LEVEL4_LIST } from '../const';




/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {

  const [form] = Form.useForm();
  const [fontList, setFontList] = useState<string>(LEVEL4_LIST);




  const handleCreateFontList = () => {
    const fontList = generateRandomChineseCharsString(153);
    setFontList(fontList);
  }





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
        <Button type="link" onClick={handleCreateFontList}>创建字体列表</Button>

        <PrintButton
          elementId="grid-container"
          printOptions={printOptions}
          buttonType="link"
          buttonText="打印"
        />
      </div>


      <DirectGridRenderer
        fontList={fontList}
        renderOptions={DefaultRenderOptions} 
        config={GridConfig}
      />

    </div>
  );
}

export default CustomCharsheetPage;