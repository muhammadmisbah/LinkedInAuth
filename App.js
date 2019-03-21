import React, { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  ScrollView,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput,
  AsyncStorage

} from 'react-native';
import Btn from './src/componenets/Button';
import { Header, Title, Tabs, Tab } from 'native-base';

const { height, width } = Dimensions.get("window")

const feelAskerTimeout = 3600000;

const colors = ["transparent", "#ff0000", "red", "orange", "#ffe200", "green"];

const Rate = ({ onPress, label, activeColor }) => (
  <View style={{ justifyContent: "space-around", width: 250, alignItems: "center", minHeight: 75, maxHeight: 90 }}>
    <Text style={{ width: "100%", flexWrap: "wrap", textAlign: "center" }}>{label}</Text>
    <View style={{ flexDirection: "row", width: 200, height: 40, alignItems: "center", justifyContent: "space-around" }}>
      {[...Array(6)].map((item, index) => {
        if (index == 0) return null
        if (colors.findIndex((val) => activeColor == val) == index) {
          return (
            <Btn key={index} text={index} disabled btnStyle={{ height: 30, width: 30, backgroundColor: activeColor }} onPress={() => { onPress(index) }} />
          )
        } else {
          return (
            <Btn key={index} text={index} btnStyle={{ height: 30, width: 30 }} onPress={() => { onPress(index) }} />
          )
        }
      })}
    </View>
  </View>
);


export default class App extends Component {

  constructor() {
    super();
    this.state = {
      foodModal: false,
      foodVal: "",
      foodColor: colors[0],
      feelColor: colors[0],
      foodList: [],
      eatList: [],
      eatModal: false,
      feelModal: false,
      counter: 1,
    }
  }

  componentWillMount() {
    // AsyncStorage.clear()
    this.getState()
    setInterval(this.reminder, 5000)
  }

  getState = () => {
    AsyncStorage.getItem("foodList").then((val) => {
      if (val) {
        this.setState({
          foodList: JSON.parse(val),
          foodVal: "",
          foodColor: colors[0],
          foodModal: false
        })
      }
    })

    AsyncStorage.getItem("eatList").then((val) => {
      if (val) {
        this.setState({
          eatList: JSON.parse(val),
          eatModal: false,
          feelModal: false
        })
      }
    })
  }

  reminder = () => {
    const { eatList } = this.state;
    if (eatList.length) {
      let eatObj = eatList[eatList.length - 1];
      let now = new Date().getTime();
      let timerTime = now - feelAskerTimeout;
      let lastitemTime = eatObj.time
      if (timerTime > lastitemTime && lastitemTime + 55000 > timerTime) {

        AsyncStorage.getItem("counter").then((val) => {
          if (val) {
            let counter = JSON.parse(val);
            if (counter < 4) {
              this.setState({ feelModal: true, counter }, this.clearAllSetTimeout)
              AsyncStorage.setItem("counter", JSON.stringify(counter + 1));
            } else {
              this.clearAllSetTimeout()
            }
          }
        })

      }
    }
  }

  addFood = () => {
    var { foodList, foodVal, foodColor } = this.state;
    if (foodColor !== colors[0] && Boolean(foodVal)) {
      foodList.push({ foodVal, foodColor })
      AsyncStorage.setItem("foodList", JSON.stringify(foodList), this.getState);
    } else {
      alert("Write the food name and put Rate of it")
    }
  }

  clearAllSetTimeout = () => {
    for (let i = 0; i < 1000; i++) {
      clearInterval(i)
    }
  }

  addEat = (item) => {
    this.clearAllSetTimeout();
    var { eatList } = this.state;
    eatList.push({
      time: new Date().getTime(), name: item.foodVal, feel: null,
    });
    AsyncStorage.setItem("eatList", JSON.stringify(eatList), this.getState);
    AsyncStorage.setItem("counter", JSON.stringify(1));
    setInterval(this.reminder, 5000)
  }

  addFeel = (i) => {
    this.clearAllSetTimeout();
    var { eatList } = this.state;
    eatList.push({
      time: new Date().getTime(), name: "", feel: `I felt ${i}`,
    });
    setInterval(this.reminder, 5000)
    AsyncStorage.setItem("eatList", JSON.stringify(eatList), this.getState);
  }



  deleteEat = (index) => {
    // var { eatList } = this.state;
    // eatList.splice(index, 1);
    // AsyncStorage.setItem("eatList", JSON.stringify(eatList), this.getState);
  }

  render() {
    return (
      <View style={{ height, width }}>
        <Header style={{ justifyContent: "center", alignItems: "center", height: 50 }} >
          <Title>Food Manager</Title>
        </Header>
        <View style={{ height: 60, width: "100%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
          <Btn text={"✚ Add Eat"} onPress={() => { this.setState({ eatModal: true }) }} />
          <Btn text={"✚ Add Food"} onPress={() => { this.setState({ foodModal: true }) }} />
        </View>
        <View style={{ flex: 1 }}>

          <Tabs tabContainerStyle={{ height: 50 }} locked>

            <Tab heading={"List"}>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={this.state.eatList}
                  style={{}}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => {
                    let Time = new Date(item.time);
                    return (
                      <View style={{ height: 45, width, backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderBottomWidth: 0.6, borderBottomColor: "#4286f4" }}>
                        <View style={{ height: "100%", width: "75%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text>{Time.toLocaleDateString("zh-Hans-CN")}</Text>
                          <Text>{Time.getHours() + ":" + Time.getMinutes()}</Text>
                          <Text>{item.name || item.feel}</Text>
                        </View>
                        <View style={{ height: "100%", width: "20%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                          {/* <Btn text={"✎"} btnStyle={{ height: 30, width: 30 }} onPress={() => { }} /> */}
                          <Btn text={"×"} btnStyle={{ height: 30, width: 30 }} onPress={() => { this.deleteEat(index) }} />
                        </View>
                      </View>
                    )
                  }}
                />
              </View>
            </Tab>

            <Tab heading={"Chart"}>
              <View style={{ flex: 1 }}>
                <ScrollView horizontal style={{}}>
                  <View style={{ height: "100%", width, }}>
                    {this.state.eatList.map((item, index) => {
                      return (
                        <View key={index} style={{}}>

                        </View>
                      )
                    })}
                  </View>
                </ScrollView>
              </View>
            </Tab>

          </Tabs>
        </View>

        <Modal
          animationType="fade"
          visible={this.state.foodModal}
          transparent
          onRequestClose={() => !this.state.foodModal}
        >
          <ScrollView keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled">
            <View style={{ height, width, backgroundColor: "rgba( 0, 0, 0, 0.7)", alignItems: "center", justifyContent: "center" }}>

              <Btn text={"×"} btnStyle={{ height: 30, width: 30, borderRadius: 15, position: "absolute", top: 20, right: 12 }} onPress={() => { this.setState({ foodModal: false }) }} />

              <View style={{ height: "50%", width: "90%", backgroundColor: "#fff", borderRadius: 5, justifyContent: "space-evenly", alignItems: "center" }}>
                <Text>Add New Food in List</Text>
                <TextInput
                  placeholder="Add Food"
                  value={this.state.foodVal}
                  maxLength={25}
                  underlineColorAndroid='transparent'
                  selectionColor="#4286f4"
                  style={{ borderBottomWidth: 1, borderBottomColor: "#4286f4", width: "70%", textAlign: "center", height: 40 }}
                  onChangeText={(val) => { this.setState({ foodVal: val }) }}
                />
                <Rate label="How does eating this normally make you feel?" activeColor={this.state.foodColor} onPress={(i) => { this.setState({ foodColor: colors[i] }) }} />
                <Btn text={"Add"} btnStyle={{ height: 30, width: "50%" }} onPress={this.addFood} />
              </View>
            </View>
          </ScrollView>
        </Modal>

        <Modal
          animationType="fade"
          visible={this.state.feelModal}
          transparent
          onRequestClose={() => !this.state.feelModal}
        >
          <View style={{ height, width, backgroundColor: "rgba( 0, 0, 0, 0.7)", alignItems: "center", justifyContent: "center" }}>

            <Btn text={"×"} btnStyle={{ height: 30, width: 30, borderRadius: 15, position: "absolute", top: 20, right: 12 }} onPress={() => { this.setState({ feelModal: false }) }} />

            <View style={{ height: "50%", width: "90%", backgroundColor: "#fff", borderRadius: 5, justifyContent: "space-evenly", alignItems: "center" }}>

              <Text>You ate {this.state.counter} hour ago</Text>

              <Rate label="How do you feel now?" activeColor={this.state.feelColor} onPress={(i) => { this.setState({ feelColor: colors[i] }) }} />
              <Btn text={"Add"} btnStyle={{ height: 30, width: "50%" }} onPress={() => {
                let i = colors.findIndex((val) => val == this.state.feelColor)
                this.state.feelColor = colors[0];
                this.addFeel(i);
              }} />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          visible={this.state.eatModal}
          transparent
          onRequestClose={() => !this.state.eatModal}
        >
          <View style={{ height, width, backgroundColor: "rgba( 0, 0, 0, 0.7)", alignItems: "center", justifyContent: "center" }}>

            <Btn text={"×"} btnStyle={{ height: 30, width: 30, borderRadius: 15, position: "absolute", top: 20, right: 12 }} onPress={() => { this.setState({ eatModal: false }) }} />

            <View style={{ height: "50%", width: "90%", backgroundColor: "#fff", borderRadius: 5, justifyContent: "space-evenly", alignItems: "center" }}>
              <Text style={{ marginVertical: 10 }}>What did you just eat?</Text>
              <FlatList
                data={this.state.foodList}
                style={{ width: "100%" }}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity onPress={() => this.addEat(item)} style={{ height: 40, width: "100%", backgroundColor: "#fff", flexDirection: "row", alignItems: "center", borderTopWidth: 0.5, borderColor: "#4286f4" }}>
                      <View style={{ height: "100%", width: "25%", justifyContent: "center", alignItems: "center" }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: item.foodColor }} />
                      </View>
                      <Text>{item.foodVal}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}