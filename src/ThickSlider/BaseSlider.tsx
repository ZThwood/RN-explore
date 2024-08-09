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
  animatedTarget: Animated.Value;
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
  // Slider 高度
  height: number;
  style?: StyleProp<ViewStyle>;
  // 拖动 Slider 过程中会持续回调
  onValueChange?: (value: number) => void;
  // 拖动 Slider 手势结束后回调
  onSlidingComplete?: (value: number) => void;
  useYAxis?: boolean;
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
    height: Dimensions.get('window').height,
  };

  animatedTarget: Animated.Value;
  animatedOffset: Animated.AnimatedInterpolation;
  animatedValue: Animated.AnimatedDivision;
  onGestureEvent: PanGestureHandlerProperties['onGestureEvent'];
  passiveControl = false;

  constructor(props: BaseSliderComponentProps) {
    super(props);
    const {useYAxis, width, height} = props;
    const sliderValue = this.toSliderValue(props.value);
    const maxSize = useYAxis ? height : width;

    this.animatedTarget = new Animated.Value(sliderValue * maxSize);

    this.animatedOffset = this.animatedTarget.interpolate({
      inputRange: [0, maxSize],
      outputRange: [0, maxSize],
      extrapolate: 'clamp',
    });

    this.animatedValue = Animated.divide(
      this.animatedOffset,
      new Animated.Value(maxSize),
    );

    props.onAnimatedValue({
      animatedTarget: this.animatedTarget,
      animatedValue: this.animatedValue,
      animatedOffset: this.animatedOffset,
    });

    this.onGestureEvent = event => {
      const {y, x} = event.nativeEvent;
      let processed = x;
      if (this.props.useYAxis) {
        processed = this.handleY(y);
      }
      this.animatedTarget.setValue(processed); // 更新 y 的值
    };

    this.animatedTarget.addListener(event => {
      if (this.passiveControl) {
        return;
      }
      const {value} = event;
      const {width, onValueChange, height, useYAxis} = this.props;

      let v = 0;
      if (useYAxis) {
        v = value / height;
      } else {
        let clampX = value;
        if (clampX < 0) {
          clampX = 0;
        } else if (clampX > width) {
          clampX = width;
        }
        v = clampX / width;
      }

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

  handleY = (y: any) => {
    const {height} = this.props;
    let processedY = y - height;

    if (processedY > 0) {
      processedY = 0;
    }

    if (processedY < 0) {
      processedY = Math.abs(processedY);
      if (Math.abs(processedY) > height) {
        processedY = height;
      }
    }

    return processedY;
  };

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
  }

  handleGestureStateChange = (event: TapGestureHandlerStateChangeEvent) => {
    const {width, onSlidingComplete, useYAxis, height} = this.props;
    const {oldState, x, y} = event.nativeEvent || {};
    this.passiveControl = false;

    if (oldState === State.ACTIVE) {
      const processedY = this.handleY(y);
      let v = 0;
      if (useYAxis) {
        let clampY = processedY;
        if (clampY < 0) {
          clampY = 0;
        } else if (clampY > height) {
          clampY = height;
        }
        v = clampY / height;
        this.animatedTarget.setValue(clampY);
      } else {
        let clampX = x;
        if (clampX < 0) {
          clampX = 0;
        } else if (clampX > width) {
          clampX = width;
        }
        v = clampX / width;
        this.animatedTarget.setValue(clampX);
      }

      if (typeof onSlidingComplete === 'function') {
        const value = this.toValue(v);
        onSlidingComplete(value);
      }
    }
  };

  onTapHandlerStateChange = this.handleGestureStateChange;

  onPanHandlerStateChange = this.handleGestureStateChange;

  setPosition = (value: number) => {
    this.passiveControl = true;
    const sliderValue = this.toSliderValue(value);
    const sizeMax = this.props.useYAxis ? this.props.height : this.props.width;
    const sliderValueToWidth = sliderValue * sizeMax;
    this.animatedTarget.setValue(sliderValueToWidth);
  };

  render(): React.ReactNode {
    const {disabled, width, children, style, height} = this.props;
    return (
      <GestureHandlerRootView style={style}>
        <TapGestureHandler
          enabled={!disabled}
          onHandlerStateChange={this.onTapHandlerStateChange}>
          <PanGestureHandler
            enabled={!disabled}
            onGestureEvent={this.onGestureEvent}
            onHandlerStateChange={this.onPanHandlerStateChange}>
            <Animated.View style={{height, width}}>{children}</Animated.View>
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
