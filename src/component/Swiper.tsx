import React, {useRef} from 'react';
import {View, StyleSheet, Dimensions, Animated, Text} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('window');

const pages = ['Page 1', 'Page 2', 'Page 3', 'Page 4'];

const PaginationExample = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  console.log('width', width * pages.length);

  const handlePanGesture = e => {
    console.log('handlePanGesture');

    Animated.event([{nativeEvent: {translationX: scrollX}}], {
      useNativeDriver: false,
    });
  };

  const handlePanStateChange = event => {
    console.log('handlePanStateChange');

    if (event.nativeEvent.state === State.END) {
      const {translationX, velocityX} = event.nativeEvent;
      const page = Math.round(-translationX / width);
      const nextPage =
        (page + Math.sign(velocityX) + pages.length) % pages.length;

      Animated.spring(scrollX, {
        toValue: -nextPage * width,
        useNativeDriver: false,
      }).start();
    }
  };

  const translateX = scrollX.interpolate({
    inputRange: [-width * (pages.length - 1), 0, width * (pages.length - 1)],
    outputRange: [-width * (pages.length - 1), 0, width * (pages.length - 1)],
    extrapolate: 'clamp',
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={handlePanStateChange}>
        <Animated.View style={[styles.slider, {transform: [{translateX}]}]}>
          {pages.map((page, index) => (
            <View key={index} style={styles.page}>
              <Text style={styles.pageText}>{page}</Text>
            </View>
          ))}
        </Animated.View>
      </PanGestureHandler>
      <View style={styles.navigation}>
        {pages.map((_, index) => (
          <View key={index} style={styles.dot} />
        ))}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    // justifyContent: 'center',
    // alignItems: 'center',
    flex: 1,
  },
  slider: {
    width: width * pages.length - 1,
    height: height - 50,
    flexDirection: 'row',
    backgroundColor: 'pink',
    // width: width * pages.length - 1,
  },
  page: {
    width: width,
    height: height - 50,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  pageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'skyblue',
    marginHorizontal: 5,
  },
});

export default PaginationExample;
