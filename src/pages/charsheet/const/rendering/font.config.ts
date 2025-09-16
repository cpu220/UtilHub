/**
 * 字体配置相关常量
 * 统一管理字体选项、字体渲染等配置
 */

/**
 * 字体选项接口
 */
export interface IFontOption {
  /** 字体显示名称 */
  label: string;
  /** 字体CSS值 */
  value: string;
  /** 字体分类 */
  category: 'system' | 'custom';
  /** 字体粗细 */
  fontWeight?: number | string;
  /** 字体大小比例 */
  fontSizeRatio?: number;
}

/**
 * 可用字体选项列表
 */
export const FONT_OPTIONS: IFontOption[] = [
  {
    label: '宋体',
    value: '"SimSun", "Songti SC", serif',
    category: 'system'
  },
  {
    label: '黑体',
    value: '"SimHei", "Heiti SC", "Microsoft YaHei", sans-serif',
    category: 'system'
  },
  {
    label: '仿宋',
    value: '"FangSong", "STFangsong", serif',
    category: 'system'
  },
  {
    label: '楷体',
    value: '"KaiTi", "Kaiti SC", cursive',
    category: 'system'
  },
  {
    label: '微软雅黑',
    value: '"Microsoft YaHei", "PingFang SC", sans-serif',
    category: 'system'
  },
  {
    label: '苹方',
    value: '"PingFangSC-Regular", "PingFang SC", sans-serif',
    category: 'system'
  },
  {
    label: '青鸟华光简行楷',
    value: '"青鸟华光简行楷", cursive',
    category: 'custom'
  },
  {
    label: '瘦金体',
    value: '"瘦金体", serif',
    category: 'custom',
    fontSizeRatio: 0.9,
    fontWeight: 400
  }
];