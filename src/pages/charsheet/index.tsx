import { Card, Col, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * 字帖生成主页
 */
export default function CharsheetPage() {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>字帖生成工具</Title>
      <Paragraph>
        欢迎使用字帖生成工具，您可以选择基础模式快速生成标准字帖，或使用自定义模式创建个性化的书法练习内容。
      </Paragraph>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card hoverable={true} style={{ height: '100%' }}>
            <Title level={4}>基础模式</Title>
            <Paragraph>简单快捷的字帖生成方式，适合初学者使用。</Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card hoverable={true} style={{ height: '100%' }}>
            <Title level={4}>自定义模式</Title>
            <Paragraph>
              提供丰富的设置选项，创建个性化的书法练习内容。
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
