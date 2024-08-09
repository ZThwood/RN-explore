import React, {useState} from 'react';
import CKColorPallet from '../CKColorPallet';
import CKColorPalletV2 from '../CKColorPallet2';

import {Image, Text, View} from 'react-native';
import CKCCTPalletV2 from '../CKCCTPalletV2';

// const palletSize = {
//   width: 70,
//   height: 337,
// };

// const palletSize = {
//   width: 337,
//   height: 70,
// };
const defaultTemperature = 0;
const getColor = ({r, g, b}: {r: number; g: number; b: number}) => {
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
};
const TestTemp = ({palletSize, source, useYAxisCCT}) => {
  const [temp, setTemp] = useState(0); // 初始颜色为红色
  const onChangeTemperature = (temperature: number, isLast: boolean) => {
    console.log('onChangeTemperature', temperature, isLast);

    setTemp(temperature);
  };

  return (
    <View
      style={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <CKCCTPalletV2
        defaultTemperature={defaultTemperature}
        onChangeTemperature={onChangeTemperature}
        timeInterval={250}
        imgPickerComp={
          <Image
            source={source}
            style={{width: palletSize.width, height: palletSize.height}}
          />
        }
        palletSize={palletSize}
        useYAxisCCT={useYAxisCCT}
      />

      <Text>{temp}</Text>
    </View>
  );
};

export default TestTemp;
