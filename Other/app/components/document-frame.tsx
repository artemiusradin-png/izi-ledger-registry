"use client";

import { useState } from "react";

type DocumentFrameProps = {
  src: string;
  title: string;
};

export default function DocumentFrame({ src, title }: DocumentFrameProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="frame-wrap" aria-busy={loading}>
      {loading ? (
        <div className="frame-loading" role="status" aria-live="polite">
          <span className="spinner" />
          <span>Loading document...</span>
        </div>
      ) : null}

      <iframe
        className="work-frame"
        title={title}
        src={src}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
