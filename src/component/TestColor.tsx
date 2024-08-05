import React, {useState} from 'react';
import CKColorPallet from '../CKColorPallet';
import {Image, View} from 'react-native';

const palletSize = {
  width: 70,
  height: 337,
};

// const palletSize = {
//   width: 337,
//   height: 70,
// };
const TestColor = () => {
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // 初始颜色为红色
  const onChangeColor = (r: number, g: number, b: number) => {
    console.log('onChangeColor', r, g, b);

    setSelectedColor(`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
  };

  return (
    <View
      style={
        {
          // transform: [{rotate: '-90deg'}],
        }
      }>
      <CKColorPallet
        defaultColor={{r: 255, g: 0, b: 0}}
        onChangeColor={onChangeColor}
        timeInterval={250}
        palletSize={palletSize}
        imgPickerComp={
          <Image
            source={require('../image/color_v.png')}
            style={{width: palletSize.width, height: palletSize.height}}
          />
        }
      />
      <View
        style={[
          {
            marginTop: 20,
            width: 100,
            height: 100,
            borderRadius: 50,
            borderColor: '#fff',
            borderWidth: 2,
          },
          {backgroundColor: selectedColor},
        ]}
      />
    </View>
  );
};

export default TestColor;
