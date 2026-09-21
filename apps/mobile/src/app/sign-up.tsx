import type { ComponentRef } from "react";

import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Button, Text, TextInput, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function SignUp() {
  const router = useRouter();
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);
  async function signUp() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.signUp.email({
        callbackURL: "ankaa://verify-email?verified=1",
        email,
        name,
        password,
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      router.replace({ params: { email }, pathname: "/verify-email" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <View>
      <TextInput
        accessibilityLabel="Name"
        autoCapitalize="words"
        autoComplete="name"
        autoFocus
        onChangeText={setName}
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="Name"
        returnKeyType="next"
        submitBehavior="submit"
        value={name}
      />
      <TextInput
        accessibilityLabel="Email"
        autoCapitalize="none"
        autoComplete="username"
        autoCorrect={false}
        keyboardType="email-address"
        onChangeText={setEmail}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="Email"
        ref={emailRef}
        returnKeyType="next"
        submitBehavior="submit"
        value={email}
      />
      <TextInput
        accessibilityLabel="Password"
        autoCapitalize="none"
        autoComplete="new-password"
        onChangeText={setPassword}
        onSubmitEditing={() => void signUp()}
        placeholder="Password"
        ref={passwordRef}
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <Button
        disabled={submitting}
        onPress={() => void signUp()}
        title="Sign up"
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Link href="/sign-in">Sign in</Link>
    </View>
  );
}
