import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions, IPrintOptions } from '../interface';

/**
 * 字帖颜色常量
 */
export const CharsheetColors = {
  // 边框和米字格颜色
  BORDER_COLOR: '#ddd',
  GRID_COLOR: '#DDD'
} as const;

// 字帖单元格默认配置参数
export const GridConfig: ICharsheetConfig = {
  width: 60,
  height: 60,
  defaultRow: 25,
  defaultCol: 10
};

/**
 * 渲染选项配置
 */
export const DefaultRenderOptions: IRenderOptions = {
        width: GridConfig.width, // 设置合适的宽度
        height: GridConfig.height, // 设置合适的高度
        strokeWidth: 3, // 设置笔画宽度
        strokeColor: '#b8b8b8', // 设置笔画颜色
        radicalColor: '#3889f2', // 偏旁颜色
        useGridBackground: true, // 使用米字格背景
        gridColor: CharsheetColors.GRID_COLOR, // 设置米字格线条颜色
        // delayBetweenLoops: 2000, // 设置动画循环间隔
        showOutline: true, // 显示汉字轮廓
        outlineColor: '#F0F0F0' // 设置轮廓颜色
}