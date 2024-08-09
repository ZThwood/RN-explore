import React, {useState} from 'react';
import ColorPallet from '../ColorPallet';
import ColorPalletV2 from '../ColorPallet2';

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
const TestColor = ({
  palletSize,
  source,
  useV2,
  useYAxisHue,
  hideMask,
  borderRadius,
}) => {
  const [selectedColor, setSelectedColor] = useState(getColor(defaultColor)); // 初始颜色为红色
  const onChangeColor = (r: number, g: number, b: number) => {
    console.log('onChangeColor', r, g, b);

    setSelectedColor(getColor({r, g, b}));
  };

  return (
    <View
      style={[
        {
          alignItems: 'center',
          borderRadius: borderRadius ?? 12,
          overflow: 'hidden',
        },
      ]}>
      {/* 蒙版 */}
      {hideMask ? null : (
        <View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 1000000,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 12,
            },
            {
              borderRadius,
              // height: '98%',
            },
          ]}
        />
      )}
      {useV2 ? (
        <ColorPalletV2
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
        <ColorPallet
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

      {/* <View
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
      /> */}
    </View>
  );
};

export default TestColor;
