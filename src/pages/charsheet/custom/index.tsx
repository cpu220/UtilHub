import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * 自定义字帖生成页面
 */
export default function CustomCharsheetPage() {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="自定义字帖生成" bordered={false}>
        <Title level={4}>高级字帖定制功能</Title>
        <Paragraph>
          这里是自定义字帖生成页面，提供更丰富的设置选项来创建个性化的书法练习内容。
        </Paragraph>
        <Paragraph>
          即将实现的功能包括：高级字体参数调整、自定义布局、特殊效果添加等。
        </Paragraph>
      </Card>
    </div>
  );
}
