import { Link } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  async function signUp() {
    try {
      const { error: responseError } = await authClient.signUp.email({
        email,
        name,
        password,
      });
      setError(
        responseError
          ? (responseError.message ?? responseError.statusText)
          : null,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    }
  }
  return (
    <View>
      <TextInput onChangeText={setName} placeholder="Name" value={name} />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        value={password}
      />
      <Button onPress={() => void signUp()} title="Sign up" />
      {error ? <Text>{error}</Text> : null}
      <Link href="/sign-in">Sign in</Link>
    </View>
  );
}
