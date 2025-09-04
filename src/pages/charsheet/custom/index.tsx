
import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Input, Button, App } from 'antd';
import type { FormProps } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter, generateRandomChineseCharsString } from '@/utils';
import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions } from '../interface';
import { LEVEL4_LIST } from '../const';
import { config, defaultRenderOptions } from './const';
import styles from './index.less';
import PrintButton from './Component/printButton';

 




/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {

  const [form] = Form.useForm();
  const [characters, setCharacters] = useState('');
  const [gridData, setGridData] = useState<IGridData>([]);
  const { message } = App.useApp();

  useEffect(() => {
    // 调用 renderGrid 方法来渲染网格
    const grid = createGrid(config.defaultCol, config.defaultRow);
    setGridData(grid);

    // 清理函数
    return () => {
      cleanupHanziWriter('grid-container');
    };
  }, [characters])

  // 当网格数据生成或更新后，自动进行字帖转换
  useEffect(() => {
    if (gridData.length > 0) {
      handleTranslate();
    }
  }, [gridData])

  const createFontList = (count: number): string => {
    // const chars = generateRandomChineseCharsString(count);
    // return chars
    const chars = LEVEL4_LIST;
    return chars;
  }

  const createGrid = (x: number, y: number): IGridData => {
    const chars = createFontList(x * y);
    // console.log(chars)
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
    // console.log(grid)
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
          fontSize: `${config.width * 0.6}px`,
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

  // 打印选项配置
  const printOptions = {
    onBeforePrint: () => {
      message.info('正在准备打印内容...');
    },
    onAfterPrint: () => {
      message.success('打印操作完成');
    }
  };

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
      const renderOptions: IRenderOptions =  {
        ...defaultRenderOptions
      }

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
      <div className={styles['button-container']}>
        <Button type="link" onClick={handleTranslate}>转化为字帖样式</Button>
        <PrintButton 
          elementId="grid-container"
          printOptions={printOptions}
          buttonType="link"
          buttonText="打印"
        />
      </div>
      <div className={styles['page-grid-container']}>
        <div id="grid-container">
          {renderGrid(gridData)}
        </div>
      </div> 
    </div>
  );
}

export default CustomCharsheetPage;