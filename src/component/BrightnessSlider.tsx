import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
const BRIGHTNESS_MIN = 0;
const BRIGHTNESS_MAX = 100;

const BrightnessSlider = ({onSliding, scrollViewRef}) => {
  const [brightness, setBrightness] = useState(50);
  const translateX = useRef(new Animated.Value(0)).current;
  const handleGestureEvent = Animated.event(
    [{nativeEvent: {translationX: translateX}}],
    {useNativeDriver: false},
  );

  const handleStateChange = event => {
    console.log(event.nativeEvent.state, event.nativeEvent.oldState);

    if (event.nativeEvent.oldState === State.ACTIVE) {
      const {translationX} = event.nativeEvent;
      const newBrightness = Math.min(Math.max(0, translationX), 300) / 3;
      setBrightness(newBrightness.toFixed(0));
      translateX.setValue(0); // Reset translateX after release
    } else if (event.nativeEvent.state === State.BEGAN) {
      onSliding(true);
    }

    if (event.nativeEvent.state === State.END) {
      onSliding(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Brightness: {brightness}%</Text>
      <GestureHandlerRootView style={styles.slider}>
        <PanGestureHandler
          waitFor={scrollViewRef}
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleStateChange}>
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [
                  {
                    translateX: translateX.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, 300],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          />
        </PanGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
};

export default BrightnessSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  slider: {
    width: 300,
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 20,
    justifyContent: 'center',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007aff',
    position: 'absolute',
  },
});
