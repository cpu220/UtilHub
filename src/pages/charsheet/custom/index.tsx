
import React, { useEffect, useState } from 'react';
import { Form, message, Row, Col, Input, Button, App, ColorPicker, InputNumber } from 'antd';
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
  const [customConfig, setCustomConfig] = useState<{ config: ICharsheetConfig, renderOptions: IRenderOptions }>({
    config: { ...GridConfig },
    renderOptions: { ...DefaultRenderOptions }
  });




  const handleCreateFontList = () => {
    const fontList = generateRandomChineseCharsString(153);
    setFontList(fontList);
  }

  // 处理表单值变化
  const handleFormChange = (changedValues: any, allValues: any) => {
    const newConfig = { ...customConfig };
    
    // 更新config部分
    if (changedValues.rows !== undefined) {
      newConfig.config.defaultRow = changedValues.rows;
    }
    if (changedValues.cols !== undefined) {
      newConfig.config.defaultCol = changedValues.cols;
    }
    
    // 更新renderOptions部分
    if (changedValues.radicalColor !== undefined) {
      newConfig.renderOptions.radicalColor = changedValues.radicalColor.toHexString();
      
    }
    if (changedValues.fontSize !== undefined) {
      newConfig.renderOptions.width = changedValues.fontSize;
      newConfig.renderOptions.height = changedValues.fontSize;
      // 同时更新config的width和height，确保单元格尺寸与字体大小同步
      newConfig.config.width = changedValues.fontSize;
      newConfig.config.height = changedValues.fontSize;
    }
    console.log(newConfig);
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
        <div id="style-option-container">
          <Form
            form={form}
            layout="inline"
            size="small"
            initialValues={{
              radicalColor: DefaultRenderOptions.radicalColor,
              rows: GridConfig.defaultRow,
              cols: GridConfig.defaultCol,
              fontSize: DefaultRenderOptions.width
            }}
            onValuesChange={handleFormChange}
          >
            <Form.Item label="笔画颜色" name="radicalColor">
              <ColorPicker />
            </Form.Item>
            <Form.Item label="行数" name="rows">
              <InputNumber min={1} max={50} />
            </Form.Item>
            <Form.Item label="列数" name="cols">
              <InputNumber min={1} max={20} />
            </Form.Item>
            <Form.Item label="字体大小" name="fontSize">
              <InputNumber min={20} max={200} />
            </Form.Item>
          </Form>
        </div>
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
        renderOptions={customConfig.renderOptions} 
        config={customConfig.config}
      />

    </div>
  );
}

export default CustomCharsheetPage;