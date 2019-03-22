import React from 'react'
import { StyleSheet, View } from 'react-native'

import LinkedInModal from 'react-native-linkedin'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <LinkedInModal
          clientID="81jepnni5s5k8v"
          clientSecret="FfNQTWvdy1QErIwg"
          redirectUri="https://www.linkedin.com/"
          onSuccess={token => console.warn(token)}
          onError={(err) => console.warn(err)}
        />
      </View>
    )
  }
}