import React from 'react';
import { Button, Affix } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

interface ScrollControllerProps {
  /**
   * 滚动容器的选择器，默认为window
   */
  container?: string | HTMLElement;
}

const ScrollController: React.FC<ScrollControllerProps> = ({
  container
}) => {
  const scrollToTop = () => {
    const scrollElement = container 
      ? (typeof container === 'string' ? document.querySelector(container) : container)
      : window;

    if (scrollElement) {
      if (scrollElement === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        (scrollElement as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const scrollToBottom = () => {
    const scrollElement = container 
      ? (typeof container === 'string' ? document.querySelector(container) : container)
      : window;

    if (scrollElement) {
      if (scrollElement === window) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        const element = scrollElement as HTMLElement;
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <Affix offsetTop={24} style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1000 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button
          type="primary"
          shape="circle"
          icon={<UpOutlined />}
          onClick={scrollToTop}
          title="滚动到顶部"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<DownOutlined />}
          onClick={scrollToBottom}
          title="滚动到底部"
        />
      </div>
    </Affix>
  );
};

export default ScrollController;