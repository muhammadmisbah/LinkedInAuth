import React, { Component } from 'react'
import { Text, StyleSheet, Dimensions } from 'react-native'
import { Button } from 'native-base'

export default class Btn extends Component {

  render() {
    return (
      <Button style={[
        styles.btnStyle,
        {
          // backgroundColor: this.props.color,
        },
        this.props.btnStyle
      ]} {...this.props}
      >
        <Text style={styles.btnText}>
          {this.props.text}
        </Text>
      </Button>
    )
  }
}
const window = Dimensions.get('window')
const styles = StyleSheet.create({
  btnStyle: {
    width: "30%",
    height: 45,
    alignSelf: 'center',
    justifyContent: 'space-around',
    elevation: 0

  },
  btnText: {
    color: 'white',
    fontSize: window.fontScale * 15
  }
})
