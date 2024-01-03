import React, { useState } from "react";
import { TextInput, HelperText, Text } from "react-native-paper";

import { View } from "react-native";

const FormTextInput = ({ label, error, ...restProps }) => {
  const [secure, setSecure] = useState(true);

  if (label === "Password") {
    return (
      <View style={{ height: 75 }}>
        <TextInput
          label={label}
          mode="outlined"
          error={!!error}
          
          outlineColor={"#5640DA"}
          selectionColor={"#5640DA"}
     
          autoCapitalize="none"
          secureTextEntry={secure}
          {...restProps}
          right={
            <TextInput.Icon
              icon={secure === true ? "eye" : "eye-off"}
              onPress={() => setSecure(!secure)}
            />
          }
        />
        {error && <HelperText type="error">{error}</HelperText>}
      </View>
    );
  } else if (label === "Confirm Password") {
    return (
      <View style={{ height: 75 }}>
        <TextInput
          label={label}
          mode="outlined"
          error={!!error}
          outlineColor={"#5640DA"}
          selectionColor={"#5640DA"}
          
     
          autoCapitalize="none"
          secureTextEntry={secure}
          {...restProps}
          right={
            <TextInput.Icon
              icon={secure === true ? "eye" : "eye-off"}
              onPress={() => setSecure(!secure)}
            />
          }
        />
        {error && <HelperText type="error">{error}</HelperText>}
      </View>
    );
  } else {
    return (
      <View style={{ height: 75 }}>
        <TextInput
          label={label}
          mode="outlined"
          error={!!error}
          outlineColor={"#5640DA"}
          selectionColor={"#5640DA"}
          
         
          
          {...restProps}
        />
        {error && <HelperText type="error">{error}</HelperText>}
      </View>
    );
  }
};

export default FormTextInput;
