import {PickerView} from '@ant-design/react-native';
import React, {useState} from 'react';
import {Button, StyleProp, View, ViewStyle} from 'react-native';
import {getCountDownTimeData} from './util';

const TimePicker = (props: {
  onChange: Function;
  defaultValue: string[];
  pickerViewStyle?: StyleProp<ViewStyle>;
}) => {
  const {onChange, defaultValue, pickerViewStyle} = props;
  const [countVal, setCountVal] = useState(defaultValue);
  const [showPick, setShowPick] = useState(false);

  const onTimeChange = (value: [string, string, string]) => {
    console.log(' time > ', value);
    setCountVal(value);
    onChange && onChange(value);
  };

  return (
    <View
      style={[
        {
          width: 420,
          height: 170,
          justifyContent: 'center',
          alignSelf: 'center',
        },
        pickerViewStyle,
      ]}>
      <Button
        onPress={() => setShowPick(!showPick)}
        title="渲染PickerView"></Button>
      {showPick && (
        <PickerView
          onChange={onTimeChange}
          value={countVal}
          data={getCountDownTimeData()}
          cascade={false}
          cols={3}
          indicatorStyle={{
            borderWidth: 20,
            flex: 1,
          }}
          itemStyle={{
            color: '#ffffff',
            fontSize: 24,
          }}
        />
      )}
    </View>
  );
};

export default TimePicker;
