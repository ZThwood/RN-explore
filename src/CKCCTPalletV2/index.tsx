import React, {PureComponent, ReactNode} from 'react';
import {Animated, ImageSourcePropType, PanResponder, View} from 'react-native';
import ColorPickerSVG from './cct_color_picker.svg';

type CKCCTPalletProps = {
  circleVisible?: boolean; // 是否显示焦点，默认为 true
  timeInterval: number;
  defaultTemperature: number;
  onChangeTemperature: (temperature: number, isLast: boolean) => void;
  imgPickerComp?: ReactNode;
  palletSize?: {
    width: number;
    height: number;
  };
  circleSize?: {
    width: number;
    height: number;
  };
  useLocationY?: boolean;
  circleSource?: ImageSourcePropType;
};

type CKCCTPalletState = {
  palletCirclePos: {x: number; y: number};
};

const TemperatureSize = 100;

// 色盘宽高
const DefaultPalletSize = {
  width: 400,
  height: 96,
};

// 焦点宽高
const DefaultCircleSize = {
  width: 30,
  height: 30,
};

const TAG = 'CKCCTPalletV2 ';

/**
 * 冷暖色盘
 *
 * 这个组件固定0代表暖光 100代表冷光，外部使用的地方自行做转换，如果需要的话。
 */
export default class CKCCTPalletV2 extends PureComponent<
  CKCCTPalletProps,
  CKCCTPalletState
> {
  static defaultProps = {
    circleVisible: true,
  };

  // 用来处理时间间隔的变量
  _intervalCache = new Date().getTime();

  /**
   * 开始响应手势时触摸点相对于父元素的横坐标
   */
  _locationX0 = 0;

  /**
   * 开始响应手势时触摸点相对于父元素的纵坐标
   */
  _locationY0 = 0;

  // 记录本地控制最后更新的 y 值
  _localY = 0;

  _panResponse = PanResponder.create({
    // 要求成为响应者：
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: evt => {
      // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
      // gestureState.{x,y} 现在会被设置为0
      this._locationX0 = evt.nativeEvent.locationX;
      this._locationY0 = evt.nativeEvent.locationY;
      this._onChangeTemperature(
        evt.nativeEvent.locationX,
        evt.nativeEvent.locationY,
      );
      this._updateCircle(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
    },
    onPanResponderMove: (evt, gestureState) => {
      // 最近一次的移动距离为gestureState.move{X,Y}
      // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
      const locationX = this._locationX0 + gestureState.dx;
      const locationY = this._locationY0 + gestureState.dy;
      this._onChangeTemperature(locationX, locationY);
      this._updateCircle(locationX, locationY);
    },
    onPanResponderTerminationRequest: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
      // 一般来说这意味着一个手势操作已经成功完成。
      console.log(TAG, 'lifecycle onPanResponderRelease trigger');
      const {timeInterval} = this.props;
      const locationX = this._locationX0 + gestureState.dx;
      const locationY = this._locationY0 + gestureState.dy;
      const onChangeTimer = setTimeout(() => {
        console.log(TAG, 'lifecycle onPanResponderRelease trigger on timeout');
        clearTimeout(onChangeTimer);
        this._onChangeTemperature(locationX, locationY, true);
      }, timeInterval);
      this._updateCircle(locationX, locationY);

      this._locationX0 = 0;
      this._locationY0 = 0;
    },
    onPanResponderTerminate: () => {
      // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
      this._locationX0 = 0;
      this._locationY0 = 0;
    },
    onShouldBlockNativeResponder: () => {
      // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
      // 默认返回true。目前暂时只支持android。
      return true;
    },
  });

  constructor(props: CKCCTPalletProps) {
    super(props);
    const defaultPosition = this._temperature2Position(
      props.defaultTemperature,
    );
    this.state = {
      palletCirclePos: {
        x: defaultPosition.x,
        y: defaultPosition.y,
      },
    };

    this.initLocalY();
  }

  initLocalY() {
    const PalletSize = this.getPalletSize();
    const CircleSize = this.getCircleSize();
    const YSize = PalletSize.height - CircleSize.height;
    this._localY = YSize * 0.5;
  }

  getPalletSize() {
    const {palletSize} = this.props;
    return palletSize ?? DefaultPalletSize;
  }

  getCircleSize() {
    const {circleSize} = this.props;
    return circleSize ?? DefaultCircleSize;
  }

  setTemperature = (temperature: number) => {
    const position = this._temperature2Position(temperature);
    console.log(TAG, 'setTemperature:', temperature);
    const y = this.props.useLocationY ? this._localY : position.y;
    // 必须要分开设置，否则把observable的值给覆盖了
    this.setState({
      palletCirclePos: {
        x: position.x,
        y,
      },
    });
  };

  // 获取当前需要显示图标的坐标
  _getPosition = (locationX: number, locationY: number) => {
    const PalletSize = this.getPalletSize();
    const CircleSize = this.getCircleSize();
    // TODO 坐标范围改为色盘布局左右各减15
    const maxLeft = PalletSize.width - CircleSize.width;
    const maxTop = PalletSize.height - CircleSize.height;
    const realLocationX =
      locationX < 0 ? 0 : locationX > maxLeft ? maxLeft : locationX;
    const realLocationY =
      locationY < 0 ? 0 : locationY > maxTop ? maxTop : locationY;
    return {x: realLocationX, y: realLocationY};
  };

  // 根据坐标计算需要返回的颜色
  _onChangeTemperature = (
    locationX: number,
    locationY: number,
    isLast = false,
  ) => {
    console.log(
      TAG,
      '_onChangeTemperature locationX',
      locationX,
      'locationY',
      locationY,
    );
    const {onChangeTemperature, timeInterval} = this.props;
    const now = new Date().getTime();
    if (now - this._intervalCache < timeInterval) {
      return;
    }
    this._intervalCache = now;
    const realPosition = this._getPosition(locationX, locationY);
    const temperature = this._position2Temperature(realPosition);
    console.log(TAG, '_onChangeTemperature temperature', temperature);
    this._localY = realPosition.y;
    onChangeTemperature && onChangeTemperature(temperature, !!isLast);
  };

  _temperature2Position = (temperature: number) => {
    if (temperature == null || temperature === -1) {
      return {x: -1, y: -1};
    }
    const PalletSize = this.getPalletSize();
    const CircleSize = this.getCircleSize();
    const XSize = PalletSize.width - CircleSize.width;
    const YSize = PalletSize.height - CircleSize.height;
    const x = (temperature / TemperatureSize) * XSize;
    const y = YSize * 0.5;
    console.log(
      TAG,
      '_temperature2Position',
      temperature,
      TemperatureSize,
      XSize,
    );
    return {x, y};
  };

  _position2Temperature = (position: ReturnType<typeof this._getPosition>) => {
    const PalletSize = this.getPalletSize();
    const CircleSize = this.getCircleSize();
    const XSize = PalletSize.width - CircleSize.width;
    return (position.x / XSize) * TemperatureSize;
  };

  _updateCircle = (locationX: number, locationY: number) => {
    console.log(
      TAG,
      '_updateCircle locationX',
      locationX,
      'locationY',
      locationY,
    );
    const realPosition = this._getPosition(locationX, locationY);
    this.setState({
      palletCirclePos: {
        x: realPosition.x,
        y: realPosition.y,
      },
    });
  };

  render() {
    const PalletSize = this.getPalletSize();
    const CircleSize = this.getCircleSize();
    const {palletCirclePos} = this.state;
    const {imgPickerComp, circleVisible, circleSource} = this.props;
    console.log(TAG, 'render:', palletCirclePos);
    const showCircle = palletCirclePos.x !== -1 || palletCirclePos.y !== -1;
    return (
      <View style={{opacity: 1}} {...this._panResponse.panHandlers}>
        {imgPickerComp ?? (
          <ColorPickerSVG width={PalletSize.width} height={PalletSize.height} />
        )}

        {circleVisible && showCircle ? (
          <Animated.Image
            source={circleSource ?? require('./pallet_circle.png')}
            style={[
              {
                width: CircleSize.width,
                height: CircleSize.height,
                position: 'absolute',
                top: palletCirclePos.y,
                left: palletCirclePos.x,
              },
            ]}
          />
        ) : null}
      </View>
    );
  }
}
