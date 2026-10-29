import type { Href } from "expo-router";

import { Link } from "expo-router";

import { Button } from "#/shared/components/button.tsx";

type LinkButtonProperties = {
  href: Href;
  title: string;
};

export function LinkButton({ href, title }: LinkButtonProperties) {
  return (
    <Link asChild href={href}>
      <Button title={title} />
    </Link>
  );
}
