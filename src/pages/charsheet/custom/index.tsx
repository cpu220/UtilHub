
import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { ICharsheetConfig, IRenderOptions } from '../interface';

import { GridConfig, getRenderOptionsByMode } from '../const';
import styles from './index.less';
import { PrintButton, DirectGridRenderer, StyleConfigForm, ImageConverter, ScrollController } from './Component';
import { TemplateType } from './Component/directGridRenderer/templates';

import { FONT_LIBRARY } from '../const';
import { IFontLibrary } from '../interface';



/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {
  console.log('CustomCharsheetPage。GridConfig', GridConfig);
  // 获取默认选中的字库
  const getDefaultFontLibrary = () => FONT_LIBRARY.find(lib => lib.select) || FONT_LIBRARY[0];
  
  const [currentFontLibrary, setCurrentFontLibrary] = useState<IFontLibrary>(getDefaultFontLibrary());
  const [customConfig, setCustomConfig] = useState<{ config: ICharsheetConfig, renderOptions: IRenderOptions }>({
    config: { ...GridConfig },
    renderOptions: getRenderOptionsByMode('stroke') // 默认使用笔画模式
  });
  const [currentTemplateType, setCurrentTemplateType] = useState<TemplateType>(TemplateType.STANDARD);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderStats, setRenderStats] = useState<{ totalPages: number; totalCells: number } | null>(null);

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

  // 处理模板类型变化的回调函数
  const handleTemplateChange = (templateType: TemplateType) => {
    setCurrentTemplateType(templateType);
    setIsRendering(true); // 开始渲染
    setRenderStats(null); // 清空之前的统计
    message.info(`已切换到${templateType === TemplateType.STANDARD ? '标准网格' : '左右分栏'}模板`);
  };

  // 处理渲染完成的回调函数
  const handleRenderComplete = (stats: { totalPages: number; totalCells: number }) => {
    setIsRendering(false);
    setRenderStats(stats);
    console.log(`渲染完成统计: ${stats.totalPages}页, ${stats.totalCells}个单元格`);
  };

  // 监听配置变化，重置渲染状态
  useEffect(() => {
    setIsRendering(true);
    setRenderStats(null);
  }, [currentFontLibrary.list, customConfig]);





  // 打印选项配置
  const printOptions = {
    onBeforePrint: () => {
      if (isRendering) {
        message.warning('内容正在渲染中，请稍后再试...');
        return false; // 阻止打印
      }
      if (!renderStats) {
        message.warning('内容尚未完全加载，请稍后再试...');
        return false; // 阻止打印
      }
      message.info(`正在准备打印内容... (${renderStats.totalPages}页, ${renderStats.totalCells}个单元格)`);
    },
    onAfterPrint: () => {
      message.success('打印操作完成');
    }
  };



  return (
    <div style={{ padding: '24px' }}>
      <div className={styles['button-container']}>
        <StyleConfigForm
          defaultRenderOptions={getRenderOptionsByMode('stroke')}
          defaultConfig={GridConfig}
          onConfigChange={handleConfigChange}
          onFontLibraryChange={handleFontLibraryChange}
          onTemplateChange={handleTemplateChange}
          defaultTemplateType={currentTemplateType}
        />
        <Button type="link" onClick={handleCreateFontList}>随机字库</Button>

        <PrintButton
          elementId="grid-container"
          printOptions={printOptions}
          buttonType="link"
          buttonText="打印"
          templateType={currentTemplateType}
        />
        <ImageConverter
        sourceElementId="page-grid-container"
        buttonType="link"
        buttonText="预览导出效果"
        previewVisible={!true}
        fontLibraryName={currentFontLibrary.name}
      />

      </div>


      <DirectGridRenderer
        fontList={currentFontLibrary.list}
        renderOptions={customConfig.renderOptions}
        config={customConfig.config}
        templateType={currentTemplateType}
        onRenderComplete={handleRenderComplete}
      />

      {/* 滚动控制器 - 悬浮在右下角 */}
      <ScrollController showThreshold={300} />

    </div>
  );
}

export default CustomCharsheetPage;