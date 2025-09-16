/**
 * 网格渲染通用 Hook
 * 提供字符渲染和网格管理的通用功能
 */

import { useCallback, useEffect, useRef } from 'react';
import { renderHanziInContainer, FontRenderer, createEmptyGridInContainer } from '@/utils';
import { IRenderOptions } from '../../../../interface';
import { RenderStats } from '@/pages/charsheet/interface';

/**
 * 网格渲染 Hook 的返回值
 */
export interface UseGridRendererReturn {
  renderCharacterToCell: (cellId: string, character: string, renderOptions: IRenderOptions) => Promise<void>;
  renderEmptyGrid: (cellId: string, renderOptions: IRenderOptions) => Promise<void>;
  clearContainer: (container: HTMLElement) => void;
  calculateRenderStats: (totalPages: number, totalCells: number, startTime: number) => RenderStats;
}

/**
 * 网格渲染通用 Hook
 */
export const useGridRenderer = (): UseGridRendererReturn => {
  const renderPromisesRef = useRef<Promise<void>[]>([]);

  /**
   * 渲染字符到单元格
   */
  const renderCharacterToCell = useCallback(
    (cellId: string, character: string, renderOptions: IRenderOptions): Promise<void> => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            // 根据渲染模式选择渲染方式
            if (renderOptions.renderMode === 'font' && renderOptions.fontFamily) {
              // 使用字体渲染模式
              FontRenderer.renderCharacterWithFont(cellId, character, {
                ...renderOptions,
                renderMode: 'font',
                fontFamily: renderOptions.fontFamily
              });
            } else {
              // 使用笔画渲染模式
              renderHanziInContainer(cellId, character, renderOptions);
            }
            resolve();
          } catch (error) {
            console.error('渲染字符失败:', error);
            resolve();
          }
        }, 150);
      });
    },
    []
  );

  /**
   * 渲染空的米字格
   */
  const renderEmptyGrid = useCallback(
    (cellId: string, renderOptions: IRenderOptions): Promise<void> => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            // 使用空字符和特殊配置来只显示田字格
            const gridOnlyOptions = {
              ...renderOptions,
              useGridBackground: true,
              showCharacter: false
            };
            
            // 使用空字符渲染，只显示田字格背景
            if (renderOptions.renderMode === 'font' && renderOptions.fontFamily) {
              // 字体模式：创建只有田字格的SVG
              createEmptyGridInContainer(cellId, renderOptions.width, renderOptions.height, renderOptions.gridColor, {
                useDashedLines: false,
                showBorder: true
              });
            } else {
              // 笔画模式：使用cnchar-draw的showCharacter: false选项
              renderHanziInContainer(cellId, '田', gridOnlyOptions);
            }
            resolve();
          } catch (error) {
            console.error('渲染空田字格失败:', error);
            resolve();
          }
        }, 150);
      });
    },
    []
  );

  /**
   * 清空容器
   */
  const clearContainer = useCallback((container: HTMLElement): void => {
    if (container) {
      container.innerHTML = '';
    }
  }, []);

  /**
   * 计算渲染统计信息
   */
  const calculateRenderStats = useCallback(
    (totalPages: number, totalCells: number, startTime: number): RenderStats => {
      const renderTime = Date.now() - startTime;
      return {
        totalPages,
        totalCells,
        renderTime
      };
    },
    []
  );

  return {
    renderCharacterToCell,
    renderEmptyGrid,
    clearContainer,
    calculateRenderStats
  };
};