import React, { useState } from 'react';
import { Button, type ButtonProps, message } from 'antd';
import { elementToImage } from '@/utils';
import { IPreviewOptions } from '../../../interface';
import styles from './index.less';

/**
 * 预览按钮属性
 */
interface PreviewButtonProps {
  /**
   * 要转换为图片的元素ID
   */
  elementId: string;

  /**
   * 图片生成选项配置
   */
  previewOptions?: Partial<IPreviewOptions>;

  /**
   * 按钮文本
   */
  buttonText?: string;

  /**
   * 按钮类型
   */
  buttonType?: ButtonProps['type'];

  /**
   * 点击事件前置处理函数
   */
  onBeforeClick?: () => void;

  /**
   * 图片生成成功后的回调函数，用于将图片数据传递给父组件
   */
  onImageGenerated?: (dataUrl: string) => void;
}

/**
 * 预览按钮组件
 * 封装了将HTML元素转换为图片的功能，用于生成预览图片
 */
const PreviewButton: React.FC<PreviewButtonProps> = ({
  elementId,
  previewOptions = {},
  buttonText = '生成预览图片',
  buttonType = 'link',
  onBeforeClick,
  onImageGenerated
}) => {

  const [resultSrc, setResultSrc] = useState<string>('');


  /**
   * 处理预览点击事件
   */
  const handlePreview = async () => {
    try {
      if (onBeforeClick) {
        onBeforeClick();
      }

      // 显示加载提示
      message.loading('正在生成预览图片...', 0);

      // 合并默认预览选项和传入的预览选项
      const mergedOptions: IPreviewOptions = {
        imageType: 'png',
        quality: 1.0,
        backgroundColor: '#ffffff',
        onBeforeGenerate: () => {
          previewOptions.onBeforeGenerate?.();
        },
        onAfterGenerate: (dataUrl) => {
          previewOptions.onAfterGenerate?.(dataUrl);
          // 如果有回调函数，将图片数据传递给父组件
          if (onImageGenerated) {
            onImageGenerated(dataUrl);
          }
        },
        ...previewOptions
      };

      // 执行图片生成操作
      const dataUrl = await elementToImage(elementId, mergedOptions);

      // 显示成功提示
      message.destroy();
      message.success('预览图片生成成功');
      setResultSrc(dataUrl);
      // 如果没有传入onImageGenerated回调，默认行为是在控制台打印dataUrl
      if (!onImageGenerated) {
        console.log('预览图片数据URL:', dataUrl);
      }

    } catch (error) {
      console.error('生成预览图片出错:', error);
      // 显示错误提示
      message.destroy();
      message.error('生成预览图片失败');
    }
  };

  return (
    <div>
      <Button
        type={buttonType}
        onClick={handlePreview}
        className={styles.previewButton}
      >
        {buttonText}
      </Button>
      <div id="result">
        <img id="result-img" src={resultSrc} />
      </div>

    </div>
  );
};

export default PreviewButton;