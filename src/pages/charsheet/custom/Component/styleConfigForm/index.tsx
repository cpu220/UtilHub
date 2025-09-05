import React, { useRef, useEffect } from 'react';
import { Form, ColorPicker, InputNumber } from 'antd';
import type { FormProps } from 'antd';
import { ICharsheetConfig, IRenderOptions } from '../../../interface';
import styles from './index.less';

interface StyleConfigFormProps {
  defaultRenderOptions: IRenderOptions;
  defaultConfig: ICharsheetConfig;
  onConfigChange: (newConfig: { config: ICharsheetConfig; renderOptions: IRenderOptions }) => void;
}

/**
 * 样式配置表单组件
 * 封装了笔画颜色、行列数、字体大小等配置项
 * 通过回调函数将配置变化传递给父组件
 */
const StyleConfigForm: React.FC<StyleConfigFormProps> = ({
  defaultRenderOptions,
  defaultConfig,
  onConfigChange
}) => {
  const [form] = Form.useForm();
  
  // 防抖计时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除防抖计时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 处理表单值变化 - 增加防抖功能
  const handleFormChange = (changedValues: any, allValues: any) => {
    const newConfig = {
      config: { ...defaultConfig },
      renderOptions: { ...defaultRenderOptions }
    };
    
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
    
    // 清除之前的计时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置新的防抖计时器，只在用户停止操作200ms后更新状态
    debounceTimerRef.current = setTimeout(() => {
      onConfigChange(newConfig);
    }, 200);
  };

  // 表单初始值
  const initialValues: any = {
    radicalColor: defaultRenderOptions.radicalColor,
    rows: defaultConfig.defaultRow,
    cols: defaultConfig.defaultCol,
    fontSize: defaultRenderOptions.width
  };

  return (
    <div id="style-option-container" className={styles['style-option-container']}>
      <Form
        form={form}
        layout="inline"
        size="small"
        initialValues={initialValues}
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
  );
};

export default StyleConfigForm;