import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * 基础字帖生成页面
 */
export default function BasicCharsheetPage() {
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
    </div>
  );
}
