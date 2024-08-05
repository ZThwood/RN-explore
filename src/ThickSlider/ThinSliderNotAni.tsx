import React, {PureComponent} from 'react';
import {
  Animated,
  ColorValue,
  Dimensions,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  Easing,
  ImageStyle,
} from 'react-native';
import BaseSlider, {BaseSliderProps, SliderAnimatedValues} from './BaseSlider';
import {Image} from 'react-native';
import {Text} from 'react-native';

interface SliderProps extends BaseSliderProps {
  unit?: string;
  trackHeight?: number;
  thumbHeight?: number;
  thumbWidth?: number;
  trackColor?: ColorValue;
  disabledTrackColor?: ColorValue;
  thumbColor?: ColorValue;
  disabledThumbColor?: ColorValue;
  labelColor?: ColorValue;
  labelVisible?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
}

interface SliderState {
  animatedOffset: Animated.AnimatedInterpolation;
  value: number;
}

const COLOR = '#1b93f0';
const COLOR_DISABLED = '#5192FD80';
const SLIDER_HEIGHT = 10;
const SLIDER_BORDER_RADIUS = 8;
const THUMB_SIZE = 20;
const LABEL_WIDTH = 30;
const LABEL_MARGIN_BOTTOM = 5;
const DEBUG = false;

/**
 * 滑杆为细样式的 Slider
 *
 * 注意：
 * 默认回调的 value 区间是 [0, 1] 可传 min 及 max 调整
 * min、max 要么都传，要么都不传，否则不生效
 * 若传了 min、max，那么初始 value 也应该在 [min, max] 区间内
 * 示例：min: 0, max: 100 则回调的 value 区间为 [0, 100]
 */
class ThinSliderNotAni extends PureComponent<SliderProps, SliderState> {
  static defaultProps = {
    value: 0,
    unit: '%',
    width: Dimensions.get('window').width,
    trackHeight: SLIDER_HEIGHT,
    thumbHeight: THUMB_SIZE,
    thumbWidth: THUMB_SIZE,
    trackColor: COLOR,
    disabledTrackColor: COLOR_DISABLED,
    thumbColor: 'white',
    disabledThumbColor: 'white',
    labelVisible: false,
    iconStyle: {},
    textStyle: {},
  };

  animatedX: Animated.Value | undefined;

  constructor(props: SliderProps) {
    super(props);
    this.state = {
      animatedOffset: new Animated.Value(0),
      value: props.value,
    };
  }
  componentDidUpdate(
    prevProps: Readonly<SliderProps>,
    prevState: Readonly<SliderState>,
  ): void {
    DEBUG &&
      console.log(
        '[ThinSliderNotAni] componentDidUpdate prevProps.value',
        prevProps.value,
        'props.value',
        this.props.value,
      );
    DEBUG &&
      console.log(
        '[ThinSliderNotAni] componentDidUpdate prevState',
        prevState,
        'state',
        this.state,
      );
    if (prevProps.value !== this.props.value) {
      const sliderValue = this.toSliderValue(this.props.value);
      // this.animatedX.setValue(sliderValue * this.props.width);
      Animated.timing(this.animatedX, {
        toValue: sliderValue * this.props.width,
        duration: 1000,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }

  onAnimatedValue = ({animatedX, animatedOffset}: SliderAnimatedValues) => {
    this.animatedX = animatedX;
    this.setState({
      animatedOffset: animatedOffset,
    });
  };

  onValueChange = (value: number) => {
    this.setState({value});
    if (typeof this.props.onValueChange === 'function') {
      this.props.onValueChange(value);
    }
  };

  /**
   * 是否支持调整最小值最大值
   */
  supportRange = () => {
    const {min, max} = this.props;
    return typeof min === 'number' && typeof max === 'number';
  };

  toSliderValue = (value: number): number => {
    DEBUG &&
      console.log(
        '[ThinSliderNotAni] toSliderValue value',
        value,
        this.supportRange(),
      );
    if (!this.supportRange()) {
      return value;
    }

    const {min, max} = this.props;
    const range = max! - min! || 1;
    let offset = this.divideValue(value) - min!;
    if (offset < 0) {
      offset = 0;
    }
    const sliderValue = offset / range;
    DEBUG &&
      console.log('[ThinSliderNotAni] toSliderValue sliderValue', sliderValue);
    return sliderValue;
  };

  getLabel = () => {
    const {unit} = this.props;
    const {value} = this.state;
    if (this.supportRange()) {
      return this.divideValue(value).toFixed() + '' + unit;
    }

    const percent = (value * 100).toFixed();
    return percent + unit;
  };

  render(): React.ReactNode {
    const {
      disabled,
      min,
      max,
      step,
      multiple,
      width,
      trackHeight,
      trackColor,
      disabledTrackColor,
      style,
      onSlidingComplete,
      textStyle,
      iconStyle,
    } = this.props;
    const {animatedOffset, value} = this.state;
    const label = this.getLabel();
    const minimumTrackBackgroundColor = disabled
      ? disabledTrackColor
      : trackColor;
    return (
      <BaseSlider
        disabled={disabled}
        value={value}
        min={min}
        max={max}
        step={step}
        multiple={multiple}
        width={width}
        style={style}
        onValueChange={this.onValueChange}
        onSlidingComplete={onSlidingComplete}
        onAnimatedValue={this.onAnimatedValue}>
        <View
          style={[
            styles.maximumTrack,
            {
              height: trackHeight,
              width,
              borderRadius: 20,
              overflow: 'hidden',
            },
          ]}>
          <Animated.View
            style={[
              styles.minimumTrack,
              {
                height: trackHeight,
                width: animatedOffset,
                backgroundColor: minimumTrackBackgroundColor,
                borderRadius: 20,
              },
            ]}
          />
          <Image
            source={require('./light.png')}
            style={[styles.icon, iconStyle]}></Image>

          <Animated.Text style={[styles.text, textStyle]}>
            {label}
          </Animated.Text>
        </View>
      </BaseSlider>
    );
  }

  divideValue = (value: number) => {
    const {multiple} = this.props;
    if (typeof multiple === 'number') {
      const quotient = value / multiple;
      return quotient;
    }
    return value;
  };
}

export default ThinSliderNotAni;

const styles = StyleSheet.create({
  maximumTrack: {
    backgroundColor: '#F1F1F1',
    borderRadius: SLIDER_BORDER_RADIUS,
  },
  minimumTrack: {
    borderRadius: SLIDER_BORDER_RADIUS,
  },
  thumb: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  text: {
    position: 'absolute',
    top: '50%',
    marginTop: -10, // 调整为字体高度的一半
    fontSize: 16,
    textAlign: 'center',
    left: '16%',
    color: 'white',
  },
  icon: {
    position: 'absolute',
    top: '50%',
    width: 20,
    height: 20,
    marginTop: -10, // 调整为图标高度的一半
    left: '8%',
  },
});
