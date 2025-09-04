 
import React, { useEffect, useState } from 'react';
import { Form, message, Input, Button, Card, Typography } from 'antd';
import type { FormProps } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter } from '@/utils';
import styles from './index.less';

const { Title, Paragraph } = Typography;

/**
 * 自定义字帖生成页面
 */
const CustomCharsheetPage : React.FC = () => {

  const [form] = Form.useForm();
  const [characters, setCharacters] = useState('');

  useEffect(()=>{
    createGrid(8,16)
  },[characters])

  const createGrid = (x:number,y:number)=>{
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

  return (
    <div style={{ padding: '24px' }}>
      
    </div>
  );
}

export default CustomCharsheetPage;