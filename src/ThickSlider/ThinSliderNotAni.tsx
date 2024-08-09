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
  LayoutRectangle,
  ViewStyle,
} from 'react-native';
import BaseSlider, {BaseSliderProps, SliderAnimatedValues} from './BaseSlider';
import {Image} from 'react-native';
import {Text} from 'react-native';

interface SliderProps extends BaseSliderProps {
  unit?: string;
  trackHeight?: number;
  thumbHeight?: number;
  thumbWidth?: number;
  traColor?: ColorValue;
  disabledTraColor?: ColorValue;
  thumbColor?: ColorValue;
  disabledThumbColor?: ColorValue;
  labelColor?: ColorValue;
  labelVisible?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  containInfoStyle?: StyleProp<ViewStyle>;
}

interface SliderState {
  animatedOffset: Animated.AnimatedInterpolation;
  value: number;
  containInfoLayout: LayoutRectangle;
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
    height: SLIDER_HEIGHT,
    thumbWidth: THUMB_SIZE,
    traColor: COLOR,
    disabledTraColor: COLOR_DISABLED,
    thumbColor: 'white',
    disabledThumbColor: 'white',
    labelVisible: false,
    iconStyle: {},
    textStyle: {},
  };

  animatedTarget: Animated.Value | undefined;
  baseSliderRef: BaseSlider | null = null;

  constructor(props: SliderProps) {
    super(props);
    this.state = {
      animatedOffset: new Animated.Value(0),
      value: props.value,
      containInfoLayout: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
      },
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

    const sliderValue = this.toSliderValue(this.props.value);
    const sizeMax = this.props.useYAxis ? this.props.height : this.props.width;
    if (prevProps.value === ThinSliderNotAni.defaultProps.value) {
      this.animatedTarget?.setValue(sizeMax);
      return;
    }

    if (prevProps.value !== this.props.value) {
      Animated.timing(this.animatedTarget!, {
        toValue: sliderValue * sizeMax,
        duration: 1000,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }

  onAnimatedValue = ({
    animatedTarget,
    animatedOffset,
  }: SliderAnimatedValues) => {
    this.animatedTarget = animatedTarget;

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

  setPosition = (value: number) => {
    this.baseSliderRef?.setPosition?.(value);
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
      height,
      traColor,
      disabledTraColor,
      style,
      onSlidingComplete,
      textStyle,
      iconStyle,
      useYAxis,
      containInfoStyle,
    } = this.props;
    const {animatedOffset, value} = this.state;
    const label = this.getLabel();
    const minimumTrackBackgroundColor = disabled ? disabledTraColor : traColor;
    return (
      <BaseSlider
        ref={ref => (this.baseSliderRef = ref)}
        disabled={disabled}
        value={value}
        min={min}
        max={max}
        step={step}
        multiple={multiple}
        width={width}
        height={height}
        style={style}
        onValueChange={this.onValueChange}
        useYAxis={useYAxis}
        onSlidingComplete={onSlidingComplete}
        onAnimatedValue={this.onAnimatedValue}>
        <View
          style={[
            styles.maximumTrack,
            {
              height,
              width,
              borderRadius: 20,
              overflow: 'hidden',
              flexDirection: useYAxis ? 'column-reverse' : 'column',
            },
          ]}>
          <Animated.View
            style={[
              styles.minimumTrack,
              {
                height: useYAxis ? animatedOffset : height,
                width: useYAxis ? width : animatedOffset,
                backgroundColor: minimumTrackBackgroundColor,
                borderRadius: 20,
              },
            ]}
          />
          <View
            onLayout={event => {
              console.log('infoRef onLayout event: ', event.nativeEvent.layout);
              this.setState({
                containInfoLayout: event.nativeEvent.layout,
              });
            }}
            style={[
              {
                position: 'absolute',
                alignItems: 'center',
              },
              useYAxis
                ? {
                    flexDirection: 'column-reverse',
                    bottom: 20,
                    left: '50%',
                    transform: [
                      {translateX: -(this.state.containInfoLayout.width / 2)},
                    ],
                  }
                : {
                    flexDirection: 'row',
                    top: '50%',
                    left: 20,
                    transform: [
                      {translateY: -(this.state.containInfoLayout.height / 2)},
                    ],
                  },
              containInfoStyle,
            ]}>
            <Image
              source={require('./light.png')}
              style={[
                styles.icon,
                useYAxis
                  ? {
                      marginTop: 15,
                    }
                  : {
                      marginRight: 15,
                    },
                iconStyle,
              ]}></Image>

            <Animated.Text style={[styles.text, textStyle]}>
              {label}
            </Animated.Text>
          </View>
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
    textAlign: 'center',
    color: 'white',
  },
  icon: {
    width: 20,
    height: 20,
  },
});
