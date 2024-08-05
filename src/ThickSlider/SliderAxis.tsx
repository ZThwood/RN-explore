import {observer} from 'mobx-react';
import React, {Component} from 'react';
import {
  ImageSourcePropType,
  LayoutChangeEvent,
  LayoutRectangle,
  PanResponder,
} from 'react-native';
import {observable} from 'mobx';
import Svg, {
  G,
  Use,
  Defs,
  Circle,
  Rect,
  Image,
  Text,
  TextAnchor,
  LinearGradient,
  Stop,
  Color,
} from 'react-native-svg';

type SliderWidth = number;
type SlidertHeight = number;

export interface SliderStyle {
  wrapMarginTop?: number;
  wrapMarginBottom?: number;
  paddingHorizontal?: number;
}

export interface AxisOpts {
  // radiusRx?: number;
  // radiusRy?: number;
  fillColor?: string;
}

export interface AxisCircleOpts {
  showTouchBtn?: boolean;
  circleR?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

export interface AxisTextOpts<T extends 'I' | 'T'> {
  showPercent?: boolean;
  textAnchor?: TextAnchor;
  textAlgin?: string;
  fontWeight?: string;
  fontSize?: number;
  fontColor?: string;
  textUnit?: string | null;
  textMarginBottom?: number;
  textMarginTop?: number;
  textMarginLeft?: T extends 'I' ? number : 0;
  textFllowBtn?: T extends 'T' ? boolean : false;
}

export interface AxisIconOpts {
  showIcon?: boolean;
  width?: number;
  height?: number;
  marginLeft?: number;
  preserveAspectRatio?: string;
  opacity?: number;
  source?: ImageSourcePropType;
}
export interface AxisProps {
  size: [SliderWidth, SlidertHeight];
  topAxis: AxisOpts;
  bottomAxis: AxisOpts;
  circleAxis: AxisCircleOpts;
  topTextAxis?: AxisTextOpts<'T'>;
  iconAxis?: AxisIconOpts;
  insideTextAxis?: AxisTextOpts<'I'>;
  useGradient?: boolean;
  gradientColors?: Color[];
  style?: SliderStyle;
}

export interface SliderProps {
  start?: (locationX: number) => void;
  move: (locationX: number, lastConfirm?: boolean) => void | Promise<void>;
  release?: Function;
  maxPerNum: number;
  minPerNum: number;
  initValue: number;
  delayTime?: number;
  borderRadius?: number;
  supportRandomTune?: boolean;
  changePressingBrightState?: Function;
}

const DEFAULT_GRADIENT_COLORS = ['#ACB6D0', '#FFFFFF'];
const CONTENT_BORDER_RADIUS = 10;
const CIRCLE_UOTSIDE_HEIGHT = 0;
const SLIDER_MARGIN_WIDTH = 2;

const TAG = 'CKSliderAxis ';

@observer
class CKSliderAxis extends Component<SliderProps & AxisProps> {
  @observable insidePositionX: number = 0; // 滑动的 x 轴距离
  @observable insidePositionY: number = 0; // 滑动的 x 轴距离

  @observable percentX: number = 100; // 滑动值
  @observable percentY: number = 100; // 滑动值

  @observable sliderRxRyWidth: number = 0; // rx，ry的动态滑动宽度，用户计算圆角时topSlider的高度以及坐标
  // 用来处理时间间隔的变量
  _intervalCache = new Date().getTime();
  /**
   * 当前实例的坐标信息
   */
  _sliderLayout!: LayoutRectangle;

  /**
   * 是否支持随调
   */
  supportRandomTune: boolean = false;

  /**
   * 记录的上一个滑动值percentX
   */
  lastPercentX: number = this.percentX;

  /**
   * 计时器防抖
   */
  timer: NodeJS.Timeout | null = null;
  lastTime: number = 0;
  delayTime: number = 200;

  /**
   * SVG样式属性设置
   */
  wrapMarginTop: number = 0;
  wrapMarginBottom: number = 0;
  paddingHorizontal: number = SLIDER_MARGIN_WIDTH;

  /**
   * 底部矩形属性初始化
   */
  bottomRadiusRx: number = CONTENT_BORDER_RADIUS;
  bottomRadiusRy: number = CONTENT_BORDER_RADIUS;
  bottomFillColor: string = 'gray';

  /**
   * 頂部矩形属性初始化
   */
  topRadiusRx: number = CONTENT_BORDER_RADIUS;
  topRadiusRy: number = CONTENT_BORDER_RADIUS;
  topFillColor: string = 'red';

  /**
   * 圆形按钮的属性初始化
   */
  showTouchBtn: boolean = false;
  circleR: number = 16;
  circleFillColor: string = 'white';
  circleStrokeColor: string = 'rgba(196, 196, 196, 0.5)';
  circleStrokeWidth: number = 1;
  circleStrokeOpacity: number = 0.8;

  /**
   * 顶部文字属性初始化
   */
  showTopPercent: boolean = false;
  topTextAnchor: TextAnchor = 'middle';
  topTextAlgin: string = 'center';
  topFontWeight: string = 'normal';
  topFontSize: number = 16;
  topFontColor: string = '#000';
  topTextMarginBottom: number = 0;
  topTextMarginTop: number = 0;
  topTextUnit: string = '';
  topTextFllowBtn: boolean = false;

  /**
   * 内部图片属性初始化
   */
  showIcon: boolean = false;
  iconWidth: number = 20;
  iconHeight: number = 20;
  iconMarginLeft: number = 0;
  iconPreserveAspectRatio: string = 'failed';
  iconOpacity: number = 1;
  iconSource: ImageSourcePropType = require('./light.png');

  /**
   * 内部文字属性初始化
   */
  showInsidePercent: boolean = false;
  insideTextAnchor: TextAnchor = 'middle';
  insideTextAlgin: string = 'center';
  insideFontWeight: string = 'normal';
  insideFontSize: number = 16;
  insideFontColor: string = '#000';
  insideTextMarginBottom: number = 0;
  insideTextMarginTop: number = 0;
  insideTextUnit: string = '';
  insideTextMarginLeft: number = 0;
  debounce = (fn: () => void, delay: number) => {
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(fn, delay);
  };

  throttle = (fn: () => void, delay: number) => {
    let now = new Date().getTime();
    if (now - delay > this.lastTime) {
      if (this.timer) {
        return;
      }
      fn();
      this.lastTime = now;
      this.timer = setTimeout(() => {
        clearTimeout(this.timer!);
        this.timer = null;
      }, delay);
    }
  };

  pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => true,
    onPanResponderStart: evt => {
      this.handlePosition(
        evt.nativeEvent.locationX,
        evt.nativeEvent.locationY,
        evt.nativeEvent.pageX,
        evt.nativeEvent.pageY,
      );
      this.props.changePressingBrightState?.(true);
      return true;
    },
    onPanResponderGrant: _evt => {
      this.props.start && this.props.start(this.percentX);
      return true;
    },
    onPanResponderMove: evt => {
      this.supportRandomTune
        ? this.throttle(() => {
            this._move(this.percentX);
          }, this.delayTime)
        : this.debounce(() => {
            this._move(this.percentX);
          }, this.delayTime);

      this.handlePosition(
        evt.nativeEvent.locationX,
        evt.nativeEvent.locationY,
        evt.nativeEvent.pageX,
        evt.nativeEvent.pageY,
      );
      return true;
    },
    onPanResponderRelease: () => {
      setTimeout(() => {
        this._move(this.percentX, true);
        this.props.release && this.props.release(this.percentX);
      }, this.delayTime);
      this.props.changePressingBrightState?.(false);
    },
  });

  _move = (bright, isLast = false) => {
    const {move} = this.props;
    const now = new Date().getTime();
    if (now - this.lastTime < this.delayTime && !isLast) {
      return;
    }
    this.lastTime = now;
    move && move(bright, !!isLast);
  };

  _onLayout = (event: LayoutChangeEvent) => {
    // console.log('heaw onLayout event: ', event.nativeEvent.layout);
    this._sliderLayout = event.nativeEvent.layout;
  };

  constructor(props: SliderProps & AxisProps) {
    super(props);
    const {initValue} = this.props;
    this.initBottomRect();
    this.initTopRect();
    this.initCircle();
    this.initTopText();
    this.initIcon();
    this.initInsideText();
    this.percentX = initValue;
    this.wrapMarginTop = this.props.style?.wrapMarginTop ?? 0;
    this.wrapMarginBottom = this.props.style?.wrapMarginBottom ?? 0;
    this.paddingHorizontal =
      this.props.style?.paddingHorizontal ?? SLIDER_MARGIN_WIDTH;
    this.updatePositionX();
    this.delayTime = this.props?.delayTime ?? 250;
    this.supportRandomTune = this.props?.supportRandomTune ?? false;
  }

  setPosition = (position: number) => {
    const {maxPerNum, minPerNum} = this.props;
    this.percentX =
      position > maxPerNum
        ? maxPerNum
        : position < minPerNum
        ? minPerNum
        : position;
    this.updatePositionX();
  };

  updatePositionX = () => {
    const [width] = this.props.size;
    const {maxPerNum, minPerNum} = this.props;
    const initCircleR =
      this.percentX <= minPerNum
        ? this.circleR
        : this.percentX >= maxPerNum
        ? -this.circleR
        : 0;

    if (this.showTouchBtn) {
      this.insidePositionX =
        (this.percentX / maxPerNum) * width +
        this.paddingHorizontal * 2 +
        initCircleR;
    } else {
      this.insidePositionX = (this.percentX / maxPerNum) * width;
      if (this.insidePositionX < this.topRadiusRx) {
        // 此时计算sliderRxRyWidth值
        this.sliderRxRyWidth = this.topRadiusRx - this.insidePositionX;
      } else {
        this.sliderRxRyWidth = 0;
      }
    }
  };

  initBottomRect = () => {
    this.bottomRadiusRx = this.props?.borderRadius ?? CONTENT_BORDER_RADIUS;
    this.bottomRadiusRy = this.props?.borderRadius ?? CONTENT_BORDER_RADIUS;
    this.bottomFillColor = this.props?.bottomAxis?.fillColor ?? 'gray';
  };

  initTopRect = () => {
    this.topRadiusRx = this.props?.borderRadius ?? CONTENT_BORDER_RADIUS;
    this.topRadiusRy = this.props?.borderRadius ?? CONTENT_BORDER_RADIUS;
    this.topFillColor = this.props?.topAxis?.fillColor ?? 'red';
  };

  initCircle = () => {
    this.showTouchBtn = this.props?.circleAxis?.showTouchBtn ?? false;
    this.circleR = this.props?.circleAxis?.circleR ?? 16;
    if (!this.showTouchBtn) {
      this.circleR = 0;
      return;
    }
    this.circleFillColor = this.props?.circleAxis?.fillColor ?? 'white';
    this.circleStrokeColor =
      this.props?.circleAxis?.strokeColor ?? 'rgba(196, 196, 196, 0.5)';
    this.circleStrokeWidth = this.props?.circleAxis?.strokeWidth ?? 1;
    this.circleStrokeOpacity = this.props?.circleAxis?.strokeOpacity ?? 0.8;
  };

  initTopText = () => {
    this.showTopPercent = this.props?.topTextAxis?.showPercent ?? false;
    if (!this.showTopPercent) {
      this.topTextMarginBottom = 0;
      this.topTextMarginTop = 0;
      return;
    }
    this.topTextAnchor = this.props?.topTextAxis?.textAnchor ?? 'middle';
    this.topTextAlgin = this.props?.topTextAxis?.textAlgin ?? 'center';
    this.topFontWeight = this.props?.topTextAxis?.fontWeight ?? 'normal';
    this.topFontSize = this.props?.topTextAxis?.fontSize ?? 16;
    this.topFontColor = this.props?.topTextAxis?.fontColor ?? '#000';
    this.topTextMarginBottom = this.props?.topTextAxis?.textMarginBottom ?? 0;
    this.topTextMarginTop = this.props?.topTextAxis?.textMarginTop ?? 0;
    this.topTextUnit = this.props?.topTextAxis?.textUnit ?? '';
    this.topTextFllowBtn = this.props?.topTextAxis?.textFllowBtn ?? false;
  };

  initIcon = () => {
    const [width, height] = this.props.size;
    console.log('initIcon hole width:', width);
    const reallyWidth = height - CIRCLE_UOTSIDE_HEIGHT;
    this.showIcon = this.props?.iconAxis?.showIcon ?? false;
    this.iconWidth = this.props?.iconAxis?.width ?? reallyWidth;
    this.iconHeight = this.props?.iconAxis?.height ?? reallyWidth;
    this.iconMarginLeft = this.props?.iconAxis?.marginLeft ?? 0;
    if (!this.showIcon) {
      this.iconWidth = 0;
      this.iconHeight = 0;
      this.iconMarginLeft = 0;
    }
    this.iconPreserveAspectRatio =
      this.props?.iconAxis?.preserveAspectRatio ?? 'failed';
    this.iconOpacity = this.props?.iconAxis?.opacity ?? 1;
    this.iconSource = this.props?.iconAxis?.source ?? require('./light.png');
  };

  initInsideText = () => {
    this.showInsidePercent = this.props?.insideTextAxis?.showPercent ?? false;
    this.insideTextAnchor = this.props?.insideTextAxis?.textAnchor ?? 'middle';
    this.insideTextAlgin = this.props?.insideTextAxis?.textAlgin ?? 'center';
    this.insideFontWeight = this.props?.insideTextAxis?.fontWeight ?? 'normal';
    this.insideFontSize = this.props?.insideTextAxis?.fontSize ?? 16;
    this.insideFontColor = this.props?.insideTextAxis?.fontColor ?? '#000';
    this.insideTextMarginBottom =
      this.props?.insideTextAxis?.textMarginBottom ?? 0;
    this.insideTextMarginTop = this.props?.insideTextAxis?.textMarginTop ?? 0;
    this.insideTextMarginLeft = this.props?.insideTextAxis?.textMarginLeft ?? 0;
    this.insideTextUnit = this.props?.insideTextAxis?.textUnit ?? '';
  };

  handlePosition = (x: number, y: number, pageX: number, pageY: number) => {
    console.log(TAG, '当前xy:', x, y);
    if (x === pageX || y === pageY) {
      return;
    }
    const [width, height] = this.props.size;
    const {maxPerNum, minPerNum} = {maxPerNum: 100, minPerNum: 0};
    const direction = 'vertical';
    if (direction === 'vertical') {
      if (y < this.paddingHorizontal) {
        // this.insidePositionX = (minPerNum / maxPerNum) * width;
        this.sliderRxRyWidth = 0;
        this.insidePositionY = 0;
        this.percentY = minPerNum;
      } else if (y > height + this.paddingHorizontal) {
        this.sliderRxRyWidth = 0;
        this.insidePositionY = height;
        this.percentY = maxPerNum;
      } else {
        this.insidePositionY = y - this.paddingHorizontal;

        if (this.insidePositionY < this.topRadiusRy) {
          // 此时计算sliderRxRyWidth值
          this.sliderRxRyWidth = this.topRadiusRy - this.insidePositionY;
        } else {
          this.sliderRxRyWidth = 0;
        }
        const finalInsidePoY = this.insidePositionY;
        const scrollHeight = height;
        this.percentY =
          minPerNum +
          Math.floor((finalInsidePoY / scrollHeight) * (maxPerNum - minPerNum));
      }
    }

    if (direction !== 'vertical') {
      if (x < this.paddingHorizontal) {
        // this.insidePositionX = (minPerNum / maxPerNum) * width;
        this.sliderRxRyWidth = 0;
        this.insidePositionX = 0;
        this.percentX = minPerNum;
      } else if (x > width + this.paddingHorizontal) {
        this.sliderRxRyWidth = 0;
        this.insidePositionX = width;
        this.insidePositionY = height;
        this.percentX = maxPerNum;
      } else {
        this.insidePositionX = x - this.paddingHorizontal;
        this.insidePositionY = y - this.paddingHorizontal;

        if (this.insidePositionX < this.topRadiusRx) {
          // 此时计算sliderRxRyWidth值
          this.sliderRxRyWidth = this.topRadiusRx - this.insidePositionX;
        } else {
          this.sliderRxRyWidth = 0;
        }
        const finalInsidePoX = this.insidePositionX;
        const scrollWidth = width;
        this.percentX =
          minPerNum +
          Math.floor((finalInsidePoX / scrollWidth) * (maxPerNum - minPerNum));
      }
    }

    console.log(TAG, '移动位置最终计算结果', {
      percentX: this.percentX,
      insidePositionX: this.insidePositionX,
      percentY: this.percentY,
      insidePositionY: this.insidePositionY,
    });
  };

  render() {
    const {gradientColors, useGradient} = this.props;
    const [width, height] = this.props.size;
    let textX = this.topFontSize;
    const insideTextString =
      this.percentX + (this.insideTextUnit ? this.insideTextUnit : '');
    if (!this.topTextFllowBtn) {
      switch (this.topTextAlgin) {
        case 'left':
          textX = this.topFontSize;
          break;
        case 'center':
          textX = (width + 2 * this.paddingHorizontal) / 2;
          break;
        case 'right':
          textX = width + 2 * this.paddingHorizontal - this.topFontSize;
          break;
      }
    } else {
      textX = this.insidePositionX;
    }

    let useYHeight =
      this.topTextMarginBottom + this.topTextMarginTop + this.wrapMarginTop;
    let svgHeight = this.showTopPercent
      ? height +
        this.topTextMarginTop +
        this.topTextMarginBottom +
        this.wrapMarginTop +
        this.wrapMarginBottom +
        this.topFontSize
      : height +
        this.topTextMarginTop +
        this.topTextMarginBottom +
        this.wrapMarginTop +
        this.wrapMarginBottom;
    if (this.showTopPercent) {
      useYHeight = useYHeight + this.topFontSize;
    }
    if (this.showTouchBtn) {
      if (height < 2 * this.circleR) {
        svgHeight = svgHeight - height + 2 * this.circleR;
        useYHeight = useYHeight + this.circleR - height / 2;
      }
    }
    const insideTextX =
      this.paddingHorizontal +
      this.iconWidth +
      this.iconMarginLeft +
      this.insideTextMarginLeft +
      (insideTextString.length * this.insideFontSize) / 2;
    const insideTextY =
      this.insideFontSize +
      (height - CIRCLE_UOTSIDE_HEIGHT - this.insideFontSize) / 2 -
      2;

    // 传了 gradientColors 可以不用传 useGradient
    const gradientColorsIsValid =
      Array.isArray(gradientColors) && gradientColors.length >= 2;
    const useGradientFinal = useGradient ?? gradientColorsIsValid;
    const gradientColorsFinal = gradientColorsIsValid
      ? gradientColors
      : DEFAULT_GRADIENT_COLORS;

    return (
      <Svg
        width={width + this.paddingHorizontal * 2}
        height={svgHeight}
        onLayout={event => this._onLayout(event)}
        {...this.pan.panHandlers}>
        {useGradientFinal ? (
          <Defs>
            <LinearGradient
              id="horizontal-gradient"
              x1="0"
              y1="0"
              x2={gradientColorsFinal.length - 1}
              y2="0">
              {gradientColorsFinal.map((color, index) => (
                <Stop offset={index} stopColor={color} stopOpacity="1" />
              ))}
            </LinearGradient>
          </Defs>
        ) : null}
        {/* 底色 */}
        <Defs>
          <G id="sliderBottom">
            <Rect
              x={this.paddingHorizontal}
              y={CIRCLE_UOTSIDE_HEIGHT / 2}
              rx={this.bottomRadiusRx}
              ry={this.bottomRadiusRy}
              width={width}
              height={height - CIRCLE_UOTSIDE_HEIGHT}
              fill={this.bottomFillColor}
            />
          </G>
        </Defs>

        {/* 填充 */}
        {/* <Defs>
          <G id="sliderTop">
            <Rect
              x={this.paddingHorizontal}
              y={CIRCLE_UOTSIDE_HEIGHT / 2 + this.sliderRxRyWidth}
              width={this.insidePositionX}
              height={height - CIRCLE_UOTSIDE_HEIGHT - 2 * this.sliderRxRyWidth}
              rx={this.topRadiusRx}
              ry={this.topRadiusRy}
              fill={
                useGradientFinal
                  ? 'url(#horizontal-gradient)'
                  : this.topFillColor
              }
            />
          </G>
        </Defs> */}

        <Defs>
          <G id="sliderTop">
            <Rect
              x={this.paddingHorizontal}
              y={CIRCLE_UOTSIDE_HEIGHT / 2 + this.sliderRxRyWidth}
              // width={this.insidePositionX}
              width={width}
              height={this.insidePositionY}
              rx={this.topRadiusRx}
              ry={this.topRadiusRy}
              fill={
                useGradientFinal
                  ? 'url(#horizontal-gradient)'
                  : this.topFillColor
              }
            />
          </G>
        </Defs>
        <Defs>
          <G id="sliderButton">
            <Circle
              cx={this.insidePositionX}
              cy={height / 2}
              r={this.circleR}
              stroke={this.circleStrokeColor}
              strokeWidth={this.circleStrokeWidth}
              strokeOpacity={this.circleStrokeOpacity}
              fill={this.circleFillColor}
            />
          </G>
        </Defs>
        <Defs>
          <G id="sliderImage">
            <Image
              x={this.paddingHorizontal + this.iconMarginLeft}
              y={
                CIRCLE_UOTSIDE_HEIGHT / 2 +
                (height - CIRCLE_UOTSIDE_HEIGHT - this.iconWidth) / 2
              }
              width={this.iconWidth}
              height={this.iconHeight}
              preserveAspectRatio={this.iconPreserveAspectRatio}
              opacity={this.iconOpacity}
              href={this.iconSource}
            />
            <Text
              x={insideTextX}
              y={insideTextY}
              textAnchor={this.insideTextAnchor}
              fontWeight={this.insideFontWeight}
              fontSize={this.insideFontSize}
              fill={this.insideFontColor}>
              {Math.floor((this.percentX / this.props.maxPerNum) * 100) +
                (this.insideTextUnit ? this.insideTextUnit : '')}
            </Text>
          </G>
        </Defs>
        {this.showTopPercent ? (
          <Text
            x={textX}
            y={this.topFontSize + this.topTextMarginTop}
            textAnchor={this.topTextAnchor}
            fontWeight={this.topFontWeight}
            fontSize={this.topFontSize}
            fill={this.topFontColor}>
            {this.percentX + (this.topTextUnit ? this.topTextUnit : '')}
          </Text>
        ) : null}
        <Use href="#sliderBottom" x="0" y={-useYHeight} />
        <Use href="#sliderTop" x="0" y={-useYHeight} />
        {this.showTouchBtn ? (
          <Use href="#sliderButton" x="0" y={useYHeight} />
        ) : null}
        {this.showIcon ? (
          <Use href="#sliderImage" x="0" y={useYHeight} />
        ) : null}
      </Svg>
    );
  }
}
export default CKSliderAxis;
