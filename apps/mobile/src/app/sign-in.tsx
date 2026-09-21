import type { ComponentRef } from "react";

import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Button, Text, TextInput, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function SignIn() {
  const router = useRouter();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);
  async function signIn() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.signIn.email({
        email,
        password,
      });
      if (responseError?.code === "EMAIL_NOT_VERIFIED") {
        setError(null);
        router.push({ params: { email }, pathname: "/verify-email" });
        return;
      }
      setError(
        responseError
          ? (responseError.message ?? responseError.statusText)
          : null,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <View>
      <TextInput
        accessibilityLabel="Email"
        autoCapitalize="none"
        autoComplete="username"
        autoCorrect={false}
        autoFocus
        keyboardType="email-address"
        onChangeText={setEmail}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="Email"
        returnKeyType="next"
        submitBehavior="submit"
        value={email}
      />
      <TextInput
        accessibilityLabel="Password"
        autoCapitalize="none"
        autoComplete="current-password"
        onChangeText={setPassword}
        onSubmitEditing={() => void signIn()}
        placeholder="Password"
        ref={passwordRef}
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <Button
        disabled={submitting}
        onPress={() => void signIn()}
        title="Sign in"
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Link href="/forgot-password">Forgot password?</Link>
      <Link href="/sign-up">Sign up</Link>
    </View>
  );
}
