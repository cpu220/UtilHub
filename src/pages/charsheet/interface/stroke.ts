/**
 * 笔画相关接口定义
 * 定义笔画展示、笔画顺序等相关的类型
 */

import React from 'react';

/**
 * 笔画颜色模式
 * 参考hanzi-writer的设计理念
 */
export type StrokeColorMode = 
  | 'single'      // 单一颜色模式
  | 'stroke'      // 每个笔画不同颜色
  | 'radical'     // 偏旁部首不同颜色
  | 'custom';     // 自定义颜色数组

/**
 * 笔画展示配置
 * 参考hanzi-writer的参数设计，统一颜色控制
 */
export interface StrokeDisplayConfig {
  /** 笔画大小 */
  strokeSize?: number;
  
  /** 颜色模式 */
  colorMode?: StrokeColorMode;
  
  /** 单一颜色（colorMode为'single'时使用） */
  fillColor?: string;
  
  /** 偏旁颜色（colorMode为'radical'时使用） */
  radicalColor?: string;
  
  /** 自定义颜色数组（colorMode为'custom'时使用） */
  customColors?: string[];
  
  /** SVG类名 */
  svgClassName?: string;
  
  /** 是否显示箭头分隔符 */
  showArrow?: boolean;
  
  /** 箭头类名 */
  arrowClassName?: string;
  
  /** 箭头字符 */
  arrowChar?: string;
}

/**
 * 笔画顺序容器配置
 */
export interface StrokeOrderContainerConfig {
  /** 容器类名 */
  containerClassName?: string;
  /** 是否可见 */
  visible?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 笔画JSX元素
 */
export interface StrokeJSXElement {
  /** 笔画索引 */
  index: number;
  /** 笔画SVG元素 */
  strokeElement: React.ReactElement;
  /** 箭头元素（如果有） */
  arrowElement?: React.ReactElement;
}

/**
 * 笔画展示结果
 */
export interface StrokeDisplayResult {
  /** 汉字字符 */
  character: string;
  /** 笔画总数 */
  strokeCount: number;
  /** 笔画JSX元素数组 */
  strokeElements: StrokeJSXElement[];
  /** 是否有错误 */
  hasError: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 行配置扩展（支持笔画顺序显示）
 */
export interface RowConfigWithStroke {
  /** 基础行配置 */
  marginBottom?: string;
  specialSpacing?: {
    every5th?: string;
    every15th?: string;
  };
  /** 笔画顺序相关配置 */
  strokeOrderVisible?: boolean;
  strokeOrder?: string;
  strokeOrderConfig?: StrokeOrderContainerConfig;
}