import React from 'react';
import {View, StyleSheet, Button} from 'react-native';
import CKSlider from './SliderAxis';
import {Text} from 'react-native';
import ThinSliderNotAni from './ThinSliderNotAni';
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // 生成一个在 min 和 max 之间的随机整数，包括 min 和 max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TAG = 'ComponentsTestScreen ';
export default class ComponentsTestScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positionX: 0,
      checked: false,
      show: true,
    };
  }

  reset = () => {};

  updatePosition = x => {
    console.log('heaw updatePosition: ', x);
    this._CKSliderAxisRef?.setPosition(x);
    this.setState({positionX: x});
  };

  onMove = x => {
    this.updatePosition(x);
  };

  render() {
    const options = {
      topAxis: {
        fillColor: '#1b93f0',
      },
      bottomAxis: {
        fillColor: '#dddddd',
      },
      circleAxis: {
        showTouchBtn: false,
        circleR: 12,
        fillColor: 'yellow',
        stroke: 'yellow',
        strokeWidth: 1,
        strokeOpacity: 0.8,
      },
      topTextAxis: {
        showPercent: false,
        textAlgin: 'center',
        textUnit: '%',
        textMarginBottom: 10,
        textMarginTop: 40,
        textFllowBtn: true,
      },
      iconAxis: {
        showIcon: true,
        marginLeft: 20,
        width: 20,
        height: 20,
      },
      insideTextAxis: {
        textMarginLeft: 0,
        textUnit: '%',
        fontColor: 'white',
      },
      style: {
        // wrapMarginTop: 10,
        // wrapMarginBottom: 20,
      },
    };

    const borderRadius = 20;
    return (
      <View
        style={[
          // StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            marginHorizontal: 10,
            borderRadius: 20,
            backgroundColor: 'green',
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '50%',
            marginBottom: 100,
          }}>
          <Button
            title={'show'}
            onPress={() => {
              this.setState({show: !this.state.show});
            }}></Button>
          <Button
            title={'check'}
            onPress={() => {
              this.setState({checked: !this.state.checked});
            }}></Button>
          <Button
            title={'开始'}
            onPress={() => {
              this.timer = setInterval(() => {
                this.updatePosition(getRandomIntInclusive(0, 100));
              }, 1500);
            }}></Button>
          <Button
            title={'stop'}
            onPress={() => {
              clearInterval(this.timer);
            }}></Button>
          <Text>{this.state.positionX}</Text>
        </View>

        {this.state.show && (
          <View>
            {/* 蒙版 */}
            {/* {!this.state.checked ? null : (
              <View
                style={[
                  styles.maskStyle,
                  {
                    borderRadius: borderRadius,
                  },
                ]}
                onStartShouldSetResponderCapture={() => true}
              />
            )} */}

            <View
              style={{
                width: 250,
                height: 65,
                // backgroundColor: 'pink',
                borderRadius: 20,
                // overflow: 'hidden',
                marginBottom: 100,
              }}>
              <CKSlider
                ref={ref => (this._CKSliderAxisRef = ref)}
                move={this.onMove}
                maxPerNum={100}
                minPerNum={0}
                initValue={this.state.positionX}
                borderRadius={borderRadius}
                // size={[200, 65]}
                size={[65, 300]}
                // supportRandomTune={true}
                {...options}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  maskStyle: {
    position: 'absolute',
    top: 10,
    left: 1,
    bottom: 20,
    right: 1,
    zIndex: 1000000,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});
