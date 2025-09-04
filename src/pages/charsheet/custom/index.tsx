
import React, { useEffect, useState } from 'react';
import { Form, Row, Col, message, Input, Button, Card, Typography } from 'antd';
import type { FormProps } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter } from '@/utils';
import styles from './index.less';

const { Title, Paragraph } = Typography;

/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage: React.FC = () => {

  const [form] = Form.useForm();
  const [characters, setCharacters] = useState('');
  const [gridData, setGridData] = useState<any[]>([]);

  useEffect(() => {
    // 调用 renderGrid 方法来渲染网格
    const grid = createGrid(8, 16); 
    setGridData(grid);
    // 清理函数
    return () => {
      cleanupHanziWriter('grid-container');
    };
  }, [characters])

  const createGrid = (x: number, y: number) => {
    const grid = [];
    for (let i = 0; i < y; i++) {
      const row = [];
      for (let j = 0; j < x; j++) {
        row.push({
          y: i,
          x: j,
          character: `${i}x${j}`,
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
  const createBlockItem = (item: any) => {
    return (
      <div 
      id={`grid-item-${item.x}-${item.y}`} 
      key={item.x + item.y} 
      className={styles['grid-item']}
      style={{
        width: '100px',
        height: '100px',
        border: '1px solid #000',
  
      }}>
        {item.character}
      </div>
    )
  }

  /**
   * 根据createGrid返回的二维数组在页面上创建方格
   * @param grid 二维数组网格数据
   */
  const renderGrid = (grid: any[]) => {
    // 存储网格数据到state
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
      )
      result.push(rowDOM);
    }

    return result;
  }

  return (
    <div style={{ padding: '24px' }}>

      <div id="grid-container">
        {renderGrid(gridData)}
      </div>
    </div>
  );
}

export default CustomCharsheetPage;