import HanziWriter from 'hanzi-writer';


const strokeColors = ['#333', '#EE00FF', '#777', '#999', '#bbb'];
const radicalColor = '#ff0000';

const defaultOptions = {
  width: 100,
  height: 100,
  strokeWidth: 5,  
  strokeColor: strokeColors[1],
}

export const renderHanziInContainer = (svgId: string, character: string, options?: any) => {

  const _opt = {
    ...defaultOptions,
    ...options,
  }
  const writer = HanziWriter.create(svgId, character, _opt);
  //   writer.draw();
}