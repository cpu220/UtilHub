import React, { useRef, useEffect } from 'react';
import { Form, ColorPicker, InputNumber, Select } from 'antd';
import type { FormProps } from 'antd';
import { ICharsheetConfig, IRenderOptions, IFontLibrary } from '../../../interface';
import { FONT_LIBRARY, FONT_OPTIONS } from '../../../const';
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
    
    // 使用allValues获取表单的完整状态，确保所有配置都被保留
    
    // 更新config部分
    if (allValues.rows !== undefined) {
      newConfig.config.defaultRow = allValues.rows;
    }
    if (allValues.cols !== undefined) {
      newConfig.config.defaultCol = allValues.cols;
    }
    
    // 更新renderOptions部分
    if (allValues.strokeColor !== undefined) {
      newConfig.renderOptions.strokeColor = allValues.strokeColor.toHexString ? allValues.strokeColor.toHexString() : allValues.strokeColor;
    }
    if (allValues.radicalColor !== undefined) {
      newConfig.renderOptions.radicalColor = allValues.radicalColor.toHexString ? allValues.radicalColor.toHexString() : allValues.radicalColor;
    }
    if (allValues.fontSize !== undefined) {
      newConfig.renderOptions.width = allValues.fontSize;
      newConfig.renderOptions.height = allValues.fontSize;
      // 同时更新config的width和height，确保单元格尺寸与字体大小同步
      newConfig.config.width = allValues.fontSize;
      newConfig.config.height = allValues.fontSize;
      // 同时更新字体模式下的字体大小
      newConfig.renderOptions.fontSize = allValues.fontSize;
    }
    
    // 更新字体相关配置 - 使用allValues确保renderMode始终被保留
    if (allValues.renderMode !== undefined) {
      newConfig.renderOptions.renderMode = allValues.renderMode;
      
      // 当切换到字体模式时，确保设置默认字体
       if (allValues.renderMode === 'font') {
         newConfig.renderOptions.fontFamily = allValues.fontFamily || FONT_OPTIONS.find(f => f.label === '黑体')?.value || FONT_OPTIONS[0]?.value;
         newConfig.renderOptions.fontSize = allValues.fontSize || defaultRenderOptions.width;
         newConfig.renderOptions.fontWeight = allValues.fontWeight || 'normal';
         newConfig.renderOptions.fontStyle = allValues.fontStyle || 'normal';
       }
    }
    if (allValues.fontFamily !== undefined) {
      newConfig.renderOptions.fontFamily = allValues.fontFamily;
    }
    if (allValues.fontWeight !== undefined) {
      newConfig.renderOptions.fontWeight = allValues.fontWeight;
    }
    if (allValues.fontStyle !== undefined) {
       newConfig.renderOptions.fontStyle = allValues.fontStyle;
     }
     // textColor已移除，统一使用strokeColor作为文字颜色
    
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
    fontLibrary: defaultFontLibrary.name,
    renderMode: defaultRenderOptions.renderMode || 'stroke',
    fontFamily: defaultRenderOptions.fontFamily || FONT_OPTIONS.find(f => f.label === '黑体')?.value || FONT_OPTIONS[0]?.value
    // textColor已移除，统一使用strokeColor
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
        
        <Form.Item label="渲染模式" name="renderMode">
          <Select style={{ width: 120 }} placeholder="选择模式">
            <Select.Option value="stroke">笔画模式</Select.Option>
            <Select.Option value="font">字体模式</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.renderMode !== currentValues.renderMode}>
          {({ getFieldValue }) => {
            const renderMode = getFieldValue('renderMode');
            return renderMode === 'font' ? (
              <Form.Item 
                label="字体选择" 
                name="fontFamily"
              >
                <Select 
                style={{ width: 200 }} 
                placeholder="选择字体"
              >
                {FONT_OPTIONS.map(font => (
                  <Select.Option key={font.value} value={font.value}>
                    {font.label}
                  </Select.Option>
                ))}
              </Select>
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </div>
  );
};

export default StyleConfigForm;