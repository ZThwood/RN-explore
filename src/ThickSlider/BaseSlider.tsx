import React, {PureComponent} from 'react';
import {Animated, Dimensions, StyleProp, ViewStyle} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerProperties,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

export enum SliderType {
  THIN = 'THIN',
}

export interface SliderAnimatedValues {
  animatedX: Animated.Value;
  animatedValue: Animated.AnimatedDivision;
  animatedOffset: Animated.AnimatedInterpolation;
}

export interface BaseSliderProps {
  // 是否禁用手势操作
  disabled?: boolean;
  // Slider 值在 [0, 1] 区间内，若传了 min、max，那么在 [min, max] 区间内
  value: number;
  // 最小值，可选，要么 min、max 都传，要么 min、max 都不传，否则不生效
  min?: number;
  // 最大值，可选，要么 min、max 都传，要么 min、max 都不传，否则不生效
  max?: number;
  // 步长，可选
  step?: number;
  // 下发值倍数，不能配置0
  multiple?: number;
  // Slider 宽度
  width: number;
  style?: StyleProp<ViewStyle>;
  // 拖动 Slider 过程中会持续回调
  onValueChange?: (value: number) => void;
  // 拖动 Slider 手势结束后回调
  onSlidingComplete?: (value: number) => void;
}

interface SliderSubComponentProps {
  onAnimatedValue: (animatedValues: SliderAnimatedValues) => void;
}

type BaseSliderComponentProps = BaseSliderProps & SliderSubComponentProps;

const DEBUG = false;

/**
 * Slider 基类
 *
 * 注意：
 * 默认回调的 value 区间是 [0, 1] 可传 min 及 max 调整
 * min、max 要么都传，要么都不传，否则不生效
 * 若传了 min、max，那么初始 value 也应该在 [min, max] 区间内
 * 示例：min: 0, max: 100 则回调的 value 区间为 [0, 100]
 */
class BaseSlider extends PureComponent<BaseSliderComponentProps> {
  static defaultProps = {
    disabled: false,
    value: 0,
    step: 1,
    width: Dimensions.get('window').width,
  };

  x: Animated.Value;
  offset: Animated.AnimatedInterpolation;
  animatedValue: Animated.AnimatedDivision;
  onGestureEvent: PanGestureHandlerProperties['onGestureEvent'];

  constructor(props: BaseSliderComponentProps) {
    super(props);
    const sliderValue = this.toSliderValue(props.value);
    this.x = new Animated.Value(sliderValue * props.width);
    this.offset = this.x.interpolate({
      inputRange: [0, props.width],
      outputRange: [0, props.width],
      extrapolate: 'clamp',
    });
    this.animatedValue = Animated.divide(
      this.offset,
      new Animated.Value(props.width),
    );
    props.onAnimatedValue({
      animatedX: this.x,
      animatedValue: this.animatedValue,
      animatedOffset: this.offset,
    });
    this.onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {x: this.x},
        },
      ],
      {
        useNativeDriver: false,
      },
    );
    this.x.addListener(({value: x}) => {
      const {width, onValueChange} = this.props;
      let clampX = x;
      if (clampX < 0) {
        clampX = 0;
      } else if (clampX > width) {
        clampX = width;
      }
      const v = clampX / width;
      if (Number.isNaN(v)) {
        console.warn('[BaseSlider] on x listener value is', v);
        return;
      }
      if (typeof onValueChange === 'function') {
        const value = this.toValue(v);
        onValueChange(value);
      }
    });
  }

  componentDidUpdate(
    prevProps: Readonly<BaseSliderComponentProps>,
    prevState: Readonly<{}>,
  ): void {
    DEBUG &&
      console.log(
        '[BaseSlider] componentDidUpdate prevProps.value',
        prevProps.value,
        'props.value',
        this.props.value,
      );
    DEBUG &&
      console.log(
        '[BaseSlider] componentDidUpdate prevState',
        prevState,
        'state',
        this.state,
      );
    // if (prevProps.value !== this.props.value) {
    //   const sliderValue = this.toSliderValue(this.props.value);
    //   this.x.setValue(sliderValue * this.props.width);
    // }
  }

  handleGestureStateChange = (event: TapGestureHandlerStateChangeEvent) => {
    const {width, onSlidingComplete} = this.props;
    const {oldState, x} = event.nativeEvent || {};
    if (oldState === State.ACTIVE) {
      let clampX = x;
      if (clampX < 0) {
        clampX = 0;
      } else if (clampX > width) {
        clampX = width;
      }
      const v = clampX / width;
      this.x.setValue(clampX);
      if (typeof onSlidingComplete === 'function') {
        const value = this.toValue(v);
        onSlidingComplete(value);
      }
    }
  };

  onTapHandlerStateChange = this.handleGestureStateChange;

  onPanHandlerStateChange = this.handleGestureStateChange;

  render(): React.ReactNode {
    const {disabled, width, children, style} = this.props;
    return (
      <GestureHandlerRootView style={style}>
        <TapGestureHandler
          enabled={!disabled}
          onHandlerStateChange={this.onTapHandlerStateChange}>
          <PanGestureHandler
            enabled={!disabled}
            onGestureEvent={this.onGestureEvent}
            onHandlerStateChange={this.onPanHandlerStateChange}>
            <Animated.View style={{width}}>{children}</Animated.View>
          </PanGestureHandler>
        </TapGestureHandler>
      </GestureHandlerRootView>
    );
  }

  /**
   * 是否支持调整最小值最大值
   */
  supportRange = () => {
    const {min, max} = this.props;
    return typeof min === 'number' && typeof max === 'number';
  };

  toSliderValue = (value: number): number => {
    DEBUG && console.log('[BaseSlider] toSliderValue value', value);
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
    DEBUG && console.log('[BaseSlider] toSliderValue sliderValue', sliderValue);
    return sliderValue;
  };

  toValue = (sliderValue: number = 0): number => {
    DEBUG && console.log('[BaseSlider] toValue sliderValue', sliderValue);
    if (!this.supportRange()) {
      return sliderValue;
    }

    const {min, max, step} = this.props;
    const stepDigits = getNumberDigits(step!);
    const range = max! - min!;
    const offset = sliderValue * range;
    // 多余的小数
    const extra = offset % step! || 0;
    // 解决 JS 小数精度问题
    const fixedExtra = extra.toFixed(stepDigits);
    const value = offset - Number(fixedExtra) + min!;
    const fixedValue = Number(value.toFixed(stepDigits));
    DEBUG && console.log('[BaseSlider] toValue fixedValue', fixedValue);
    return this.multipleValue(fixedValue);
  };

  multipleValue = (value: number) => {
    const {multiple} = this.props;
    if (typeof multiple === 'number') {
      const product = value * multiple;
      DEBUG && console.log('[BaseSlider] multipleValue product', product);
      return product;
    }
    return value;
  };

  divideValue = (value: number) => {
    const {multiple} = this.props;
    if (typeof multiple === 'number') {
      const quotient = value / multiple;
      DEBUG && console.log('[BaseSlider] divideValue quotient', quotient);
      return quotient;
    }
    return value;
  };
}

export default BaseSlider;
function getNumberDigits(n: number) {
  if (!n) {
    return 0;
  }
  const digitsStr = n.toString().split('.')[1] || '';
  return digitsStr.length;
}
