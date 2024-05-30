/**
 * Created by yoo on 2019/12/26.
 **/

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import CKSlider from './CKThickSlider';

const TAG = 'ComponentsTestScreen ';
export default class ComponentsTestScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  reset = () => {};

  updatePosition = (x) => {
    console.log('heaw updatePosition: ', x);
    this.positionX = x;
  };

  render() {
    const options = {
      topAxis: {
        fillColor: '#1b93f0',
      },
      bottomAxis: {
        fillColor: '#51536a',
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
        wrapMarginTop: 10,
        wrapMarginBottom: 10,
      },
    };
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: 'center', justifyContent: 'center' },
        ]}>
        <CKSlider
          move={this.updatePosition}
          release={this.reset}
          maxPerNum={100}
          minPerNum={0}
          initValue={16}
          delayTime={250}
          borderRadius={5}
          size={[300, 70]}
          supportRandomTune={true}
          {...options}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});
