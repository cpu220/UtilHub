import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import type { FormProps } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter } from '@/utils';
import styles from './index.less';


const { Title, Paragraph } = Typography;

type IFieldType = {
  character: string;
};

/**
 * 基础字帖生成页面
 */
const BasicCharsheetPage: React.FC = () => {
  const [form] = Form.useForm();
  const [character, setCharacter] = useState<string>('待');


  useEffect(() => {
    const strokeColors = ['#333', '#EE00FF', '#777', '#999', '#bbb'];
    const radicalColor = '#168F16';
    const options = {
      width: 100,
      height: 100,
      strokeWidth: 5,
      radicalColor: radicalColor,
      strokeColor: strokeColors[1],
      delayBetweenLoops:1000
    };

    renderHanziInContainer('a1', character, options);

    // 在组件卸载时清理资源
    return () => {
      cleanupHanziWriter('a1');
    };
  }, [character]);



  const onFinish: FormProps<IFieldType>['onFinish'] = (values) => {
     
    console.log('Success:', values);
    setCharacter(values.character);
  };


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

      <div className={styles['from-container']} >
        <Form
          layout={"inline"}
          form={form}
          initialValues={{ character: "赢" }}
          onFinish={onFinish}
        >
          <Form.Item label="汉字" name="character">
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </div>

      <div id="a1" className={styles['font-container']}></div>
    </div>


  );
}

export default BasicCharsheetPage;