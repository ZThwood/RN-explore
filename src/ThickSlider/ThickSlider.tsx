import {observable} from 'mobx';
import {observer} from 'mobx-react';
import React, {Component} from 'react';
import CKSliderAxis, {AxisProps, SliderProps} from './SliderAxis';

type ContentWidth = number;
type ContentHeight = number;

interface Graph {
  content?: {
    size?: [ContentWidth, ContentHeight];
  };
}

interface LineProps extends AxisProps, SliderProps {
  graph?: Graph;
}

@observer
class CKThickSlider extends Component<LineProps> {
  @observable positionX: number = 0; // 滑动的 x 轴距离
  _ref: CKSliderAxis | null = null;

  render() {
    return <CKSliderAxis ref={ref => (this._ref = ref)} {...this.props} />;
  }
}

export default CKThickSlider;
