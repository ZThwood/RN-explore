/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableWithoutFeedback,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {Thread} from 'react-native-threads';
import UploadFile from './uploadFile';
import ImageList from './ImageList';
import MobxPerformanceTest from './MobxPerformanceTest';
import ComponentsTestScreen from './ThickSlider/ComponentsTestScreen';
import SimpleSlider from './ThickSlider/BaseSlider';
import ThinSliderNotAni from './ThickSlider/ThinSliderNotAni';
import BrightnessSlider from './component/BrightnessSlider';
import TimePicker from './PickerView/TimePicker';
import Swiper from './component/Swiper';
import ThickSlider from './ThickSlider/ThickSlider';
import TestColor from './component/TestColor';
import TestTemp from './component/TestTemp';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSliding, setIsSliding] = useState(false);
  const scrollViewRef = useRef(null);
  const [value, setValue] = useState(22);

  const backgroundStyle = {
    // backgroundColor: 'orange',
    flex: 1,
  };
  // return <Swiper></Swiper>;

  // return (
  //   <View
  //     style={{
  //       flex: 1,
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //     }}>
  //     {/* <TestTemp
  //       palletSize={{
  //         width: 70,
  //         height: 337,
  //       }}
  //       source={require('./image/temp_v.png')}
  //       useYAxisCCT={true}></TestTemp>

  //     <TestTemp
  //       palletSize={{
  //         width: 337,
  //         height: 70,
  //       }}
  //       source={require('./image/temp.png')}
  //       useYAxisCCT={undefined}></TestTemp> */}

  //     {/* <TestColor
  //       palletSize={{
  //         width: 300,
  //         height: 100,
  //       }}
  //       hideMask={false}
  //       // borderRadius={16}
  //       source={require('./image/rgb_pallet_picker.png')}
  //       useYAxisCCT={false}></TestColor> */}
  //   </View>
  // );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        scrollEnabled={!isSliding}
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        {/* <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            height: 200,
          }}></View> */}

        {/* <BrightnessSlider
          onSliding={setIsSliding}
          scrollViewRef={scrollViewRef}
        /> */}
        <TouchableWithoutFeedback
          style={{
            width: 100,
            height: 100,
            backgroundColor: 'pink',
          }}
          onPress={() => setValue(value + 10)}>
          <Text
            style={{
              width: 100,
              height: 100,
              fontSize: 34,
              backgroundColor: 'pink',
            }}>
            {'按我'}
          </Text>
        </TouchableWithoutFeedback>
        <ThinSliderNotAni
          labelVisible={false}
          width={70}
          // thumbHeight={20}
          trackHeight={337}
          onSlidingComplete={value => {
            console.log('[OperationCard] onSlidingComplete', {
              value,
            });
            setIsSliding(false);
            setValue(value);
          }}
          disabled={false}
          style={{marginRight: 14, alignItems: 'center'}}
          value={value}
          onValueChange={() => {
            setIsSliding(true);
          }}
          // thumbColor={'#e9e9e9'}
          // disabledThumbColor={'#e9e9e9'}
          useYAxis
          min={0}
          max={100}
          height={337}
        />

        <ThinSliderNotAni
          labelVisible={false}
          width={337}
          height={70}
          onSlidingComplete={value => {
            console.log('[OperationCard] onSlidingComplete', {
              value,
            });
            setIsSliding(false);
            setValue(value);
          }}
          disabled={false}
          style={{marginRight: 14, alignItems: 'center'}}
          value={value}
          onValueChange={() => {
            setIsSliding(true);
          }}
          // thumbColor={'#e9e9e9'}
          // disabledThumbColor={'#e9e9e9'}
          min={0}
          max={100}
        />
        {/* <View
          style={{
            backgroundColor: 'pink',
            height: 200,
            marginTop: 50,
          }}></View>
        <View
          style={{
            backgroundColor: 'skyblue',
            height: 200,
            marginTop: 50,
          }}></View> */}
      </ScrollView>

      {/* <ImageList></ImageList> */}
      {/* <MobxPerformanceTest></MobxPerformanceTest> */}
      {/* <ComponentsTestScreen></ComponentsTestScreen> */}
      {/* <TimePicker onChange={() => {}} defaultValue={[]}></TimePicker> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 54,
  },
});

export default App;
