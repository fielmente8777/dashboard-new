import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-1 text-muted-foreground animate-pulse">
        <div>
          <img src="/ICON ORANGE.ico" alt="Loading" className="h-15 w-15" />
        </div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
