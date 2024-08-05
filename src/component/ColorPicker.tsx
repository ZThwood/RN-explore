import React, {useRef, useState} from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Text,
} from 'react-native';

// const gradientHeight = 70; // 你可以根据图片的实际高度调整
// const gradientWidth = 337;
const gradientHeight = 337; // 你可以根据图片的实际高度调整
const gradientWidth = 70;
const ColorPicker = () => {
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // 初始颜色为红色
  const [gradientTopOffset, setGradientTopOffset] = useState(0); // 存储渐变条的垂直偏移量
  // 手势识别
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        // console.log('onPanResponderMove', gestureState.moveX);

        // let x = Math.min(Math.max(0, gestureState.moveY), gradientWidth); // 限制 x 在渐变条宽度范围内
        // console.log('onPanResponderMove x', x, gestureState.moveY);

        let y = Math.min(Math.max(0, gestureState.moveY), gradientHeight); // 限制 y 在渐变条高度范围内
        console.log(
          'onPanResponderMove y',
          y,
          gestureState.moveY,
          gestureState.dy,
        );

        // 计算选择的颜色
        const newColor = calculateRGBColor(y, gradientHeight);
        setSelectedColor(newColor);

        // 计算选择的颜色
        // const newColor = calculateRGBColor(x, gradientWidth);
        // setSelectedColor(newColor);
      },
    }),
  ).current;

  // 计算 RGB 颜色
  const calculateRGBColor = (x, width) => {
    // 计算相对于渐变条宽度的比例
    const position = x / width;

    // 将比例映射到 RGB 颜色范围
    const red = Math.round(255 * Math.abs(1 - 2 * Math.min(position, 0.5)));
    const green = Math.round(
      255 * Math.abs(position <= 0.5 ? 2 * position : 2 * (1 - position)),
    );
    const blue = Math.round(
      255 * Math.abs(position > 0.5 ? 2 * (position - 0.5) : 0),
    );

    // 返回 RGB 颜色的十六进制表示
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <View
      style={[
        styles.container,
        // {transform: [{rotate: '-90deg'}]}
      ]}>
      <Text style={styles.label}>Selected Color: {selectedColor}</Text>
      <ImageBackground
        source={require('../image/color_v.png')} // 使用您上传的图片路径
        style={styles.gradient}
        onLayout={event => {
          const layout = event.nativeEvent.layout;
          console.log('layout', layout);

          setGradientTopOffset(layout.y); // 获取渐变条相对于父视图的偏移量
        }}
        {...panResponder.panHandlers} // 绑定手势处理
      >
        {/* 在图片上添加一个透明的触摸层以处理手势 */}
        <View style={styles.touchLayer} />
      </ImageBackground>
      <View
        style={[styles.selectedColorBox, {backgroundColor: selectedColor}]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  gradient: {
    width: gradientWidth,
    height: gradientHeight,
    borderRadius: 25,
    overflow: 'hidden', // 确保圆角效果
  },
  touchLayer: {
    flex: 1,
  },
  selectedColorBox: {
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#fff',
    borderWidth: 2,
  },
  label: {
    color: '#fff',
    marginBottom: 10,
  },
});

export default ColorPicker;
