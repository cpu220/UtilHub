import React, { useRef, useEffect } from 'react';
import { Form, ColorPicker, InputNumber, Select } from 'antd';
import type { FormProps } from 'antd';
import { ICharsheetConfig, IRenderOptions, IFontLibrary } from '../../../interface';
import { FONT_LIBRARY } from '../../../const';
import styles from './index.less';

interface StyleConfigFormProps {
  defaultRenderOptions: IRenderOptions;
  defaultConfig: ICharsheetConfig;
  onConfigChange: (newConfig: { config: ICharsheetConfig; renderOptions: IRenderOptions }) => void;
  onFontLibraryChange: (fontLibrary: IFontLibrary) => void;
}

/**
 * 样式配置表单组件
 * 封装了笔画颜色、行列数、字体大小等配置项
 * 通过回调函数将配置变化传递给父组件
 */
const StyleConfigForm: React.FC<StyleConfigFormProps> = ({
  defaultRenderOptions,
  defaultConfig,
  onConfigChange,
  onFontLibraryChange
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
    if (changedValues.strokeColor !== undefined) {
      newConfig.renderOptions.strokeColor = changedValues.strokeColor.toHexString();
    }
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

  // 获取默认选中的字库
  const defaultFontLibrary = FONT_LIBRARY.find(lib => lib.select) || FONT_LIBRARY[0];

  // 表单初始值
  const initialValues: any = {
    strokeColor: defaultRenderOptions.strokeColor,
    radicalColor: defaultRenderOptions.radicalColor,
    rows: defaultConfig.defaultRow,
    cols: defaultConfig.defaultCol,
    fontSize: defaultRenderOptions.width,
    fontLibrary: defaultFontLibrary.name
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
        <Form.Item label="笔画颜色" name="strokeColor">
          <ColorPicker />
        </Form.Item>
        <Form.Item label="偏旁颜色" name="radicalColor">
          <ColorPicker />
        </Form.Item>
        <Form.Item label="行数" name="rows">
          <InputNumber min={1} max={5000} />
        </Form.Item>
        <Form.Item label="列数" name="cols">
          <InputNumber min={1} max={20} />
        </Form.Item>
        <Form.Item label="字体大小" name="fontSize">
          <InputNumber min={20} max={200} />
        </Form.Item>
        <Form.Item label="字库选择" name="fontLibrary">
          <Select
            style={{ width: 200 }}
            placeholder="请选择字库"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
              (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              const selectedLibrary = FONT_LIBRARY.find(lib => lib.name === value);
              if (selectedLibrary) {
                // 清除之前的防抖计时器
                if (debounceTimerRef.current) {
                  clearTimeout(debounceTimerRef.current);
                }
                // 使用防抖机制延迟触发字库变化
                debounceTimerRef.current = setTimeout(() => {
                  onFontLibraryChange(selectedLibrary);
                }, 200);
              }
            }}
          >
            {FONT_LIBRARY.map(library => (
              <Select.Option key={library.name} value={library.name}>
                {library.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default StyleConfigForm;