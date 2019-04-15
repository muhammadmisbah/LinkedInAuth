import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image, AsyncStorage } from 'react-native'

import LinkedInModal from './src/containers/LinkedInView';
import CookieManager from 'react-native-cookies';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
})

var linkedinText = "LinkedIn offers opportunities to the network every day. Advantages for Business : Get connected: Like any social site, LinkedIn is about networking, but because it is a site that's focused on professionals and businesses, your company can network effectively with prospective client organizations."

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {
        fName: "",
        lName: "",
        email: "",
        photo: "",
      },
      loading: false,
    }
  }

  componentDidMount() {
    this.getUser()
  }

  getUser = () => {
    AsyncStorage.getItem("user").then((val) => {
      if (val) {
        let user = JSON.parse(val);
        this.setState({ user })
      } else {
        this.setState({
          user: {
            fName: "",
            lName: "",
            email: "",
            photo: "",
          },
          loading: false,
        });
      }
    })
  }

  render() {
    let { loading, user } = this.state;
    return (
      <View style={styles.container}>
        {loading ?
          <View style={{ top: 0, bottom: 0, right: 0, left: 0, backgroundColor: "rgba( 0, 0, 0, 0.4)", position: "absolute", zIndex: 10, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator color="#0077B5" size="large" />
          </View>
          : null
        }
        <View style={{ justifyContent: "center", alignItems: "center", width: "100%", paddingVertical: 10 }}>
          <Image source={require("./src/assets/linkedInLogo.png")} style={{ width: "90%", height: 100, resizeMode: "contain", marginVertical: 5 }} />
          {user.email ? null
            :
            <View style={{ width: "100%", alignItems: "center" }}>
              <Text style={{ width: "70%", flexWrap: "wrap", textAlign: "center", color: "#000", fontSize: 14, marginVertical: 10 }}>{linkedinText}</Text>
              <Image source={require("./src/assets/people.gif")} style={{ width: "90%", height: 300, resizeMode: "contain", marginTop: "2%" }} />
            </View>
          }
        </View>

        <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
          {user.photo ? <Image source={{ uri: user.photo }} style={{ height: 200, width: 200, borderRadius: 100, marginBottom: 5 }} /> : null}
          <Text style={{ fontSize: 20, color: "#000", marginBottom: 5 }}>{user.fName}</Text>
          <Text style={{ fontSize: 20, color: "#000", marginBottom: 5 }}>{user.lName}</Text>
          <Text style={{ fontSize: 16 }}>{user.email}</Text>
          {/* <Text>{user.photo}</Text> */}
        </View>


        <View style={{ width: "100%", paddingBottom: 10, alignItems: "center" }}>
          {user.email ?
            <TouchableOpacity style={{ height: 40, width: 170, backgroundColor: "#0077B5", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => {
              CookieManager.clearAll().then((a) => {
                AsyncStorage.clear().then(this.getUser);
                alert("Loged Out")
              })
            }}>
              <Text style={{ color: 'white' }}>LogOut</Text>
            </TouchableOpacity>
            : <LinkedInModal
              clientID={clientID}
              clientSecret={clientSecret}
              redirectUri="https://linkedin.com"
              permissions={['r_liteprofile', 'r_emailaddress']}
              renderButton={() => <Image source={require("./src/assets/signinbtn.png")} style={{ height: 60, width: 270, resizeMode: "contain" }} />}
              onSuccess={user => {
                AsyncStorage.setItem("user", JSON.stringify(user), this.getUser)
                // console.warn(user)
              }}
              onError={(err) => console.warn("err", err)}
              shouldGetAccessToken={true}
              loading={(loading) => { this.setState({ loading }) }}
            // onOpen={(a) => console.warn(a)}
            />}
        </View>

      </View >
    )
  }
}
