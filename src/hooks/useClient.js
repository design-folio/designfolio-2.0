import React, { useEffect, useState } from "react";

export default function useClient() {
  const [isClient, setIsclient] = useState(false);

  useEffect(() => {
    setIsclient(true);
  }, []);

  return { isClient };
}
