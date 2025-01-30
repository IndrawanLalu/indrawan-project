import { XFlow, FlowchartCanvas, createGraphConfig } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const graphConfig = createGraphConfig({
  connecting: {
    // Mengizinkan node saling terhubung
    allowBlank: false,
  },
});

const nodes = [
  {
    id: "source",
    x: 150,
    y: 50,
    label: "Source",
  },
  {
    id: "transformer",
    x: 150,
    y: 150,
    label: "Transformer",
  },
  {
    id: "load",
    x: 150,
    y: 250,
    label: "Load",
  },
];

const edges = [
  { id: "e1", source: "source", target: "transformer" },
  { id: "e2", source: "transformer", target: "load" },
];

const SingleLineDiagram = () => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <XFlow>
        <FlowchartCanvas
          nodes={nodes}
          edges={edges}
          config={graphConfig}
          style={{ backgroundColor: "#f5f5f5" }}
        />
      </XFlow>
    </div>
  );
};

export default SingleLineDiagram;
