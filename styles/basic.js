import React, { Platform, StyleSheet } from "react-native";

export let page = StyleSheet.create({
  container: {
    // padding: 5,
    // marginTop: 15,
    // backgroundColor:'#5640DA',
    flex: 1,
    // marginBottom:150
    // backgroundColor:'red'
  },

  h2: {
    fontSize: 25,
    color: "#5640DA",
    // marginTop:20
  },
});

export let element = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#5640DA",
    marginVertical: 10,
    borderRadius: 15,
  },
  title: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  stats: {
    fontSize: 15,
    color: "#5640DA",
    fontWeight: "bold",
  },
  description: {
    fontSize: 15,
    color: "white",
  },

  flex2: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export let details = StyleSheet.create({
  container: {
    padding: 20,
    display: "flex",
    flex: 1,
    // backgroundColor:"red"
  },
  title: {
    fontSize: 25,
    color: "#5640DA",
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: "10%",
    textAlign: "center",
    // alignItems:'center'
  },
  description: {
    fontSize: 15,
    // textAlign:"center",
    marginTop: 20,
    color: "#5640DA",
  },
  sections: {
    flex: 2,
    gap: 25,
  },

  imp: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 20,
  },

  highlightedInfo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5640DA",
  },
  dateTime: {
    position: "absolute",
    padding: 20,
    top: "45%",
    left: "30%",
    zIndex: 11,
    backgroundColor:
      Platform.OS === "ios" ? "rgb(209, 204, 240)" : "rgba(0,0,0,0)",
    borderRadius: 10,
  },
});

export let userDet = StyleSheet.create({
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  data: {
    fontSize: 15,
    color: "#fff",
  },
  settings: {
    paddingHorizontal: 20,
    gap: 10,
  },
  modal: {
    position: "absolute",
    padding: 20,
    width: "90%",
    top: "0%",
    left: "5%",
    zIndex: 12,
    borderRadius: 10,
    backgroundColor: "rgb(209, 204, 240)",
  },
});

export let rewards = StyleSheet.create({
  container: {
    padding: 20,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#5604DA",
    margin: 10,
  },
  name: {
    color: "#5640DA",
    fontSize: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 10,
    color: "#5640DA",
  },
  subHead: {
    marginHorizontal: 20,
    textAlign: "right",
    fontSize: 15,
    color: "#5640DA",
    fontWeight: "bold",
  },
  flexSB:{
    display:"flex",
    flexDirection:"row",
    alignItems:'center',
    justifyContent:"space-between",
  }
});
