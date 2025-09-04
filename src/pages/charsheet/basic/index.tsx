import React, { useEffect } from 'react';
import { Card, Typography } from 'antd';
import HanziWriter from 'hanzi-writer';
import { renderHanziInContainer } from '@/utils'
import styles from './index.less';


const { Title, Paragraph } = Typography;

/**
 * 基础字帖生成页面
 */
const BasicCharsheetPage: React.FC = () => {

  const strokeColors = ['#333', '#EE00FF', '#777', '#999', '#bbb'];
  const radicalColor = '#168F16';


  const options = {
    width: 100,
    height: 100,
    strokeWidth: 5,
    radicalColor: radicalColor,
    strokeColor: strokeColors[1],
  };

  useEffect(() => { 
    renderHanziInContainer('a1', '腻', options);
  }, []);


  return (
    <div style={{ padding: '24px' }}>
      <Card title="基础字帖生成" bordered={false}>
        <Title level={4}>基础字帖生成功能</Title>
        <Paragraph>
          这里是基础的字帖生成页面，用户可以选择预设的字帖模板和参数来生成书法练习内容。
        </Paragraph>
        <Paragraph>
          即将实现的功能包括：字体选择、文字内容设置、纸张样式选择等。
        </Paragraph>
      </Card>

      <div id="a1" className={styles['font-container']}></div>
    </div>


  );
}

export default BasicCharsheetPage;