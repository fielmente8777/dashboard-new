export default function MessageNode({ node, updateNode }) {
  const data = node.data || {};

  return (
    <textarea
      className="border w-full p-2"
      placeholder="Message Text"
      value={data.text || ""}
      onChange={(e) => updateNode(node.id, { text: e.target.value })}
    />
  );
}
