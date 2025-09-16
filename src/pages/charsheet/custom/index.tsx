
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { message, Button } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { ICharsheetConfig, IRenderOptions, IFontLibrary } from '@/pages/charsheet/interface';
import { GridConfig, getRenderOptionsByMode, refreshFontScale, FONT_LIBRARY, TemplateType } from '@/pages/charsheet/const';
import styles from './index.less';
import { PrintButton, DirectGridRenderer, StyleConfigForm, ImageConverter, ScrollController } from './Component';



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
  const [currentTemplateType, setCurrentTemplateType] = useState<TemplateType>(TemplateType.SINGLE_ROW);
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

  // 使用useCallback优化回调函数，避免不必要的重新渲染
  const handleConfigChange = useCallback((newConfig: { config: ICharsheetConfig; renderOptions: IRenderOptions }) => {
    setCustomConfig(newConfig);
  }, []);

  const handleFontLibraryChange = useCallback((fontLibrary: IFontLibrary) => {
    setCurrentFontLibrary(fontLibrary);
  }, []);

  const handleTemplateChange = useCallback((templateType: TemplateType) => {
    setCurrentTemplateType(templateType);
    setIsRendering(true);
    setRenderStats(null);
    message.info(`已切换到${templateType === TemplateType.STANDARD ? '标准网格' : templateType === TemplateType.LEFT_RIGHT ? '左右分栏' : '单行网格'}模板`);
  }, []);

  const handleRenderComplete = useCallback((stats: { totalPages: number; totalCells: number }) => {
    setIsRendering(false);
    setRenderStats(stats);
    console.log(`渲染完成统计: ${stats.totalPages}页, ${stats.totalCells}个单元格`);
  }, []);

  // 页面初始化时调用refreshFontScale
  useEffect(() => {
    refreshFontScale();
  }, []);

  // 监听配置变化，重置渲染状态
  useEffect(() => {
    setIsRendering(true);
    setRenderStats(null);
  }, [currentFontLibrary.list, customConfig]);

  // 使用useMemo优化defaultRenderOptions，避免每次渲染都重新创建
  const memoizedDefaultRenderOptions = useMemo(() => {
    return getRenderOptionsByMode('stroke');
  }, []);

  // 使用useMemo优化defaultConfig，避免每次渲染都重新创建
  const memoizedDefaultConfig = useMemo(() => {
    return { ...GridConfig };
  }, []);





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
      return true; // 允许打印
    },
    onAfterPrint: () => {
      message.success('打印操作完成');
    }
  };



  return (
    <div style={{ padding: '24px' }}>
      <div className={styles['button-container']}>
        <StyleConfigForm
          defaultRenderOptions={memoizedDefaultRenderOptions}
          defaultConfig={memoizedDefaultConfig}
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
        previewVisible={true}
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
      <ScrollController />

    </div>
  );
}

export default CustomCharsheetPage;