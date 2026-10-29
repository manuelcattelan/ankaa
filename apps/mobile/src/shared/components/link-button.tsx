import type { Href } from "expo-router";

import { Link } from "expo-router";

import { Button } from "#/shared/components/button.tsx";

export function LinkButton({ href, title }: { href: Href; title: string }) {
  return (
    <Link asChild href={href}>
      <Button title={title} />
    </Link>
  );
}
