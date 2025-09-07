import React, { useState, useRef } from 'react';
import { Button, message, Space, Dropdown, MenuProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { elementToImage } from '@/utils';
import styles from './index.less';

interface ImageConverterProps {
  /**
   * 要转换为图片的元素ID
   */
  sourceElementId: string;

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
 * 将指定元素转换为图片并显示在内置结果容器中，支持PNG和JPG格式导出
 */
const ImageConverter: React.FC<ImageConverterProps> = ({
  sourceElementId,
  buttonText = '转换为图片',
  buttonType = 'primary'
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const resultContainerRef = useRef<HTMLDivElement>(null);

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
      setCurrentImageData(dataUrl);

      // 显示图片在内置结果容器中
      if (resultContainerRef.current) {
        // 清空结果容器
        resultContainerRef.current.innerHTML = '';
        
        // 创建图片元素
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';
        img.style.marginTop = '16px';
        
        // 添加图片到结果容器
        resultContainerRef.current.appendChild(img);
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

  /**
   * 导出字帖图片
   */
  const exportCharsheet = async (format: 'png' | 'jpeg' = exportFormat) => {
    try {
      const formatName = format === 'png' ? 'PNG' : 'JPG';
      message.loading(`正在生成${formatName}字帖...`, 0);
      
      const options = {
        imageType: format,
        quality: format === 'png' ? 1.0 : 0.98,
        backgroundColor: '#ffffff',
        useCanvg: true,
        // 对于JPG格式，强制设置白色背景
        ...(format === 'jpeg' && {
          style: {
            backgroundColor: '#ffffff'
          }
        })
      };

      const dataUrl = await elementToImage(sourceElementId, options);
      
      // 创建下载链接
      const link = document.createElement('a');
      const extension = format === 'png' ? 'png' : 'jpg';
      link.download = `字帖_${Date.now()}.${extension}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.destroy();
      message.success(`${formatName}字帖导出成功`);
    } catch (error) {
      console.error('导出字帖出错:', error);
      message.destroy();
      message.error('字帖导出失败');
    }
  };

  // 下拉菜单选项
  const formatMenuItems: MenuProps['items'] = [
    {
      key: 'png',
      label: 'PNG格式 (推荐)',
      onClick: () => {
        setExportFormat('png');
        exportCharsheet('png');
      }
    },
    {
      key: 'jpeg',
      label: 'JPG格式',
      onClick: () => {
        setExportFormat('jpeg');
        exportCharsheet('jpeg');
      }
    }
  ];

  return (
    <div className={styles.imageConverter}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button
            type={buttonType}
            onClick={handleConvert}
            loading={isConverting}
          >
            {buttonText}
          </Button>
          
          <Dropdown.Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => exportCharsheet()}
            menu={{ items: formatMenuItems }}
          >
            导出字帖 ({exportFormat.toUpperCase()})
          </Dropdown.Button>
        </Space>
        
        {/* 内置结果容器 */}
        <div 
          ref={resultContainerRef}
          className={styles.resultContainer}
        />
      </Space>
    </div>
  );
};

export default ImageConverter;