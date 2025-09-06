import React, { useState } from 'react';
import { Button, message } from 'antd';
import { elementToImage } from '@/utils';
import styles from './index.less';

interface ImageConverterProps {
  /**
   * 要转换为图片的元素ID
   */
  sourceElementId: string;

  /**
   * 显示结果图片的容器ID
   */
  resultElementId: string;

  /**
   * 按钮文本
   */
  buttonText?: string;

  /**
   * 按钮类型
   */
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

/**
 * 图片转换器组件
 * 将指定元素转换为图片并显示在结果容器中
 */
const ImageConverter: React.FC<ImageConverterProps> = ({
  sourceElementId,
  resultElementId,
  buttonText = '转换为图片',
  buttonType = 'primary'
}) => {
  const [isConverting, setIsConverting] = useState(false);

  /**
   * 处理转换点击事件
   */
  const handleConvert = async () => {
    try {
      setIsConverting(true);
      message.loading('正在转换图片...', 0);

      // 使用canvg处理SVG，特别是hanzi-writer生成的SVG
      const options = {
        imageType: 'png' as 'png',
        quality: 1.0,
        backgroundColor: '#ffffff',
        useCanvg: true, // 强制使用canvg处理SVG
        onBeforeGenerate: () => {
          console.log('开始生成图片...');
        },
        onAfterGenerate: (dataUrl: string) => {
          console.log('图片生成完成');
        }
      };

      // 执行图片生成操作
      const dataUrl = await elementToImage(sourceElementId, options);

      // 获取结果容器并显示图片
      const resultContainer = document.getElementById(resultElementId);
      if (resultContainer) {
        // 清空结果容器
        resultContainer.innerHTML = '';
        
        // 创建图片元素
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';
        img.style.marginTop = '16px';
        
        // 添加图片到结果容器
        resultContainer.appendChild(img);
      }

      message.destroy();
      message.success('图片转换成功');
    } catch (error) {
      console.error('转换图片出错:', error);
      message.destroy();
      message.error('图片转换失败');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className={styles.imageConverter}>
      <Button
        type={buttonType}
        onClick={handleConvert}
        loading={isConverting}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default ImageConverter;