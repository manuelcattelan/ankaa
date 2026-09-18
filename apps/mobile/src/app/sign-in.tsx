import { Link } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  async function signIn() {
    try {
      const { error: responseError } = await authClient.signIn.email({
        email,
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
      <Button onPress={() => void signIn()} title="Sign in" />
      {error ? <Text>{error}</Text> : null}
      <Link href="/sign-up">Sign up</Link>
    </View>
  );
}
