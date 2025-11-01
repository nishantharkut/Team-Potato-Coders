import React from "react";

const MainLayout = async ({ children }) => {
  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto mt-24 mb-20">{children}</div>
    </div>
  );
};

export default MainLayout;
