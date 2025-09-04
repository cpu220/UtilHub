import React, { useEffect, useState } from 'react';
import { Form, message, Input, Button, Card, Typography } from 'antd';
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
  const [character, setCharacter] = useState<string>('赢');


  useEffect(() => {
 
    const options = {
      width: 400,
      height: 400,
      strokeWidth: 5,
      radicalColor: '#168F16',
      strokeColor: '#000',
      useGridBackground: true,
      delayBetweenLoops: 1000
    };

    renderHanziInContainer('a1', character, options);

    // 在组件卸载时清理资源
    return () => {
      cleanupHanziWriter('a1');
    };
  }, [character]);



  const onFinish: FormProps<IFieldType>['onFinish'] = (values) => {

    console.log('Success:', values);
    const newCharacter = values.character.trim();
    if (newCharacter.length > 1) {
      console.log(newCharacter[0]);
      setCharacter(newCharacter[0]);
    } else {
      message.error('请输入一个汉字');
      return
    }

  };


  return (
    <div style={{ padding: '24px' }}>
      

      <div className={styles['from-container']} >
        <Form 
          layout={"inline"}
          form={form}
          initialValues={{ character: character }}
          onFinish={onFinish}
        >
          <Form.Item
            label="汉字"
            name="character"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
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