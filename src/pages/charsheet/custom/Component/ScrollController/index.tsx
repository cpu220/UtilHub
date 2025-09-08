import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import styles from './index.less';

interface ScrollControllerProps {
  /**
   * 滚动容器的选择器，默认为window
   */
  container?: string | HTMLElement;
  /**
   * 显示阈值，滚动超过多少像素后显示按钮
   */
  showThreshold?: number;
}

const ScrollController: React.FC<ScrollControllerProps> = ({
  container,
  showThreshold = 300
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = container 
        ? (container as HTMLElement).scrollTop || (document.querySelector(container as string))?.scrollTop || 0
        : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      setVisible(scrollTop > showThreshold);
    };

    const scrollElement = container 
      ? (typeof container === 'string' ? document.querySelector(container) : container)
      : window;

    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [container, showThreshold]);

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

  if (!visible) {
    return null;
  }

  return (
    <div className={styles['scroll-controller']}>
      <Button
        type="primary"
        shape="circle"
        icon={<UpOutlined />}
        onClick={scrollToTop}
        className={styles['scroll-button']}
        title="滚动到顶部"
      />
      <Button
        type="primary"
        shape="circle"
        icon={<DownOutlined />}
        onClick={scrollToBottom}
        className={styles['scroll-button']}
        title="滚动到底部"
      />
    </div>
  );
};

export default ScrollController;