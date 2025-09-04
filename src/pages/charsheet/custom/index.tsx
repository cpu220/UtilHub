
import React, { useEffect, useState } from 'react';
import { Form, Row, Col, message, Input, Button, Card, Typography } from 'antd';
import type { FormProps } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, printElementById, generateRandomChineseCharsString, generateRandomChineseChar } from '@/utils';
import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions, IPrintOptions } from '../interface';
import styles from './index.less';

const { Title, Paragraph } = Typography;

// 配置参数
const config: ICharsheetConfig = {
  width: 60,
  height: 60,
  defaultRow: 12,
  defaultCol: 10
};

/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {

  const [form] = Form.useForm();
  const [characters, setCharacters] = useState('');
  const [gridData, setGridData] = useState<IGridData>([]);

  useEffect(() => {
    // 调用 renderGrid 方法来渲染网格
    const grid = createGrid(config.defaultCol, config.defaultRow); 
    setGridData(grid);
    
    // 清理函数
    return () => {
      cleanupHanziWriter('grid-container');
    };
  }, [characters])

  const createFontList = (count: number): string => {
    const chars = generateRandomChineseCharsString(count);
    return chars
  }

  const createGrid = (x: number, y: number): IGridData => {
    const chars = createFontList(x * y);
    console.log(chars)
    const grid: IGridData = [];
    let index = 0;
    for (let i = 0; i < y; i++) {
      const row: IGridItem[] = [];
      for (let j = 0; j < x; j++) {
        row.push({
          y: i,
          x: j,
          character: chars[index++],  
        });
      }
      grid.push(row);
    }
    console.log(grid)
    return grid;
  }

  /**
   * 创建单个方格项
   * @param item 网格项
   * @returns React节点
   */
  const createBlockItem = (item: IGridItem) => {
    return (
      <div 
      id={`grid-item-${item.x}-${item.y}`} 
      key={item.x + item.y} 
      className={styles['grid-item']}
      style={{
        width: config.width + 'px',
        height: config.height + 'px',
        border: '1px solid #ddd',
        fontSize: `${config.width*0.6}px`,
      }}
      >
        {item.character}
      </div>
    );
  }

  /**
   * 根据createGrid返回的二维数组在页面上创建方格
   * @param grid 二维数组网格数据
   */
  const renderGrid = (grid: IGridData) => {
    const result = [];
    for (let i = 0; i < grid.length; i++) {
      const row = [];
      for (let j = 0; j < grid[i].length; j++) {
        const item = grid[i][j];
        const blockItem = createBlockItem(item);
        row.push(blockItem);
      }
      const rowDOM = (
        <div id={`grid-row-${i}`} key={i} className={styles['grid-row']}> {row}</div>
      );
      result.push(rowDOM);
    }

    return result;
  }

  /**
   * 打印网格
   */
  const handlePrintGrid = () => {
    const printOptions: IPrintOptions = {
      title: '自定义字帖打印',
      showPreview: false,
      styles: [
        // 打印专用样式
        `
        .grid-item {
          page-break-inside: avoid;
          margin: 2px;
        }
        .grid-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
        `
      ],
      onBeforePrint: () => {
        message.info('正在准备打印内容...');
      },
      onAfterPrint: () => {
        message.success('打印操作完成');
      }
    };
    
    printElementById('grid-container', printOptions);
  }

  const handleTranslate = () => {
    try {
      // 获取网格容器
      const gridContainer = document.getElementById('grid-container');
      if (!gridContainer) {
        message.error('未找到网格容器');
        return;
      }
      
      message.info('正在将文本转换为字帖样式...');
      
      // 渲染选项配置
      const renderOptions: IRenderOptions = {
        width: config.width, // 设置合适的宽度
        height: config.height, // 设置合适的高度
        strokeWidth: 3, // 设置笔画宽度
        strokeColor: '#bbbcbd', // 设置笔画颜色
        radicalColor: '#168F16',
        useGridBackground: true, // 使用米字格背景
        gridColor: '#DDD', // 设置米字格线条颜色
        // delayBetweenLoops: 2000, // 设置动画循环间隔
        showOutline: true, // 显示汉字轮廓
        outlineColor: '#F0F0F0' // 设置轮廓颜色
      };
      
      // 遍历每一行
      gridData.forEach((row, rowIndex) => {
        row.forEach((item, colIndex) => {
          // 获取对应的DOM元素
          const cellElement = document.getElementById(`grid-item-${colIndex}-${rowIndex}`);
          if (cellElement) {
            // 清空单元格内容
            cellElement.innerHTML = '';
            
            // 设置样式以确保米字格能正确显示
            cellElement.style.display = 'flex';
            cellElement.style.alignItems = 'center';
            cellElement.style.justifyContent = 'center';
            
            // 使用 renderHanziInContainer 方法渲染带米字格的汉字
            renderHanziInContainer(cellElement.id, item.character, renderOptions);
          }
        });
      });
      
      message.success('字帖样式转换完成');
    } catch (error) {
      console.error('转换为字帖样式时出错:', error);
      message.error('转换失败，请重试');
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <div>
        <Button onClick={handleTranslate}>转化为字帖样式</Button>
        <Button onClick={handlePrintGrid}>打印</Button>
      </div>
      <div id="grid-container">
        {renderGrid(gridData)}
      </div>
    </div>
  );
}

export default CustomCharsheetPage;