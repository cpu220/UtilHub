import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions, IPrintOptions } from '../interface';


// 配置参数
export const config: ICharsheetConfig = {
  width: 60,
  height: 60,
  defaultRow: 25,
  defaultCol: 10
};

/**
 * 渲染选项配置
 */
export const defaultRenderOptions: IRenderOptions = {
        width: config.width, // 设置合适的宽度
        height: config.height, // 设置合适的高度
        strokeWidth: 3, // 设置笔画宽度
        strokeColor: '#c3c3c3', // 设置笔画颜色
        radicalColor: '#168F16',
        useGridBackground: true, // 使用米字格背景
        gridColor: '#DDD', // 设置米字格线条颜色
        // delayBetweenLoops: 2000, // 设置动画循环间隔
        showOutline: true, // 显示汉字轮廓
        outlineColor: '#F0F0F0' // 设置轮廓颜色
}