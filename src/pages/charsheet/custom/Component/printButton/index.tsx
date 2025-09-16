import React from 'react';
import { Button, type ButtonProps } from 'antd';
import { printElementById } from '@/utils';
import { IPrintOptions } from '../../../interface';
import { TemplateType } from '@/pages/charsheet/const';
import styles from './index.less';

interface PrintButtonProps {
  /**
   * 要打印的HTML元素ID
   */
  elementId: string;
  /**
   * 打印配置选项
   */
  printOptions?: Partial<IPrintOptions>;
  /**
   * 按钮文本
   */
  buttonText?: string;
  /**
   * 按钮类型
   */
  buttonType?: ButtonProps['type'];
  /**
   * 点击前的回调函数
   */
  onBeforeClick?: () => void;
  /**
   * 当前使用的模板类型（用于动态加载样式）
   */
  templateType?: TemplateType;
}

/**
 * 打印按钮组件
 * 封装了打印功能的按钮，用于触发页面元素的打印操作
 */
const PrintButton: React.FC<PrintButtonProps> = ({
  elementId,
  printOptions = {},
  buttonText = '打印',
  buttonType = 'link',
  onBeforeClick,
  templateType = TemplateType.STANDARD,
}) => {
  /**
   * 处理打印点击事件
   */
  const handlePrint = async () => {
    try {
      if (onBeforeClick) {
        onBeforeClick();
      }

      // 获取当前时间作为默认左上角时间
      const currentTime = new Date().toLocaleString();

      // 合并默认打印选项和传入的打印选项
      const mergedOptions: IPrintOptions = {
        // title: '自定义字帖打印',
        title: '',
        showPreview: false,
        styles: [
          // 使用统一样式管理系统，自动从web样式获取
          // getPrintStyles会自动获取元素的计算样式
          ...(printOptions.styles || []),
        ],
        onBeforePrint: () => {
          // 如果onBeforePrint返回false，则阻止打印
          const result = printOptions.onBeforePrint?.();
          return result !== false; // 只有明确返回false才阻止打印
        },
        onAfterPrint: () => {
          printOptions.onAfterPrint?.();
        },
        // 传递当前时间到左上角，如果不需要显示，设置为undefined
        // topLeftTime: currentTime,
        // 传递about:blank到左下角，如果不需要显示，设置为undefined
        // bottomLeftContent: 'about:blank',
        ...printOptions,
      };

      // 执行打印操作
      await printElementById(elementId, mergedOptions);
    } catch (error) {
      console.error('打印操作出错:', error);
      // 这里可以根据需要添加错误处理
    }
  };

  return (
    <Button 
      type={buttonType} 
      onClick={handlePrint}
      className={styles.printButton}
    >
      {buttonText}
    </Button>
  );
};

export default PrintButton;