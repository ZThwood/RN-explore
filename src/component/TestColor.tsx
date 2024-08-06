import React, {useState} from 'react';
import CKColorPallet from '../CKColorPallet';
import CKColorPalletV2 from '../CKColorPallet2';

import {Image, View} from 'react-native';

// const palletSize = {
//   width: 70,
//   height: 337,
// };

// const palletSize = {
//   width: 337,
//   height: 70,
// };
const defaultColor = {r: 234, g: 255, b: 140};
const getColor = ({r, g, b}: {r: number; g: number; b: number}) => {
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
};
const TestColor = ({palletSize, source, useV2, useYAxisHue}) => {
  const [selectedColor, setSelectedColor] = useState(getColor(defaultColor)); // 初始颜色为红色
  const onChangeColor = (r: number, g: number, b: number) => {
    console.log('onChangeColor', r, g, b);

    setSelectedColor(getColor({r, g, b}));
  };

  return (
    <View
      style={
        {
          // transform: [{rotate: '-90deg'}],
        }
      }>
      {useV2 ? (
        <CKColorPalletV2
          defaultColor={defaultColor}
          onChangeColor={onChangeColor}
          timeInterval={250}
          palletSize={palletSize}
          imgPickerComp={
            <Image
              source={source}
              style={{width: palletSize.width, height: palletSize.height}}
            />
          }
        />
      ) : (
        <CKColorPallet
          defaultColor={defaultColor}
          onChangeColor={onChangeColor}
          timeInterval={250}
          palletSize={palletSize}
          useYAxisHue={useYAxisHue}
          imgPickerComp={
            <Image
              source={source}
              style={{width: palletSize.width, height: palletSize.height}}
            />
          }
        />
      )}

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
