const Loader = ({ size = 20, color = "#000" }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderTop: `2px solid ${color}`,
      }}
      className="rounded-full border-t animate-spin"
    />
  );
};

export default Loader;
