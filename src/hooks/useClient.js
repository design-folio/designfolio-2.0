import React, { useEffect, useState, startTransition } from "react";

export default function useClient() {
  const [isClient, setIsclient] = useState(false);

  useEffect(() => {
    startTransition(() => setIsclient(true));
  }, []);

  return { isClient };
}
