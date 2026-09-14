import "./index.css";
import { Composition } from "remotion";
import { SPECS } from "./specs";
import { SpecVideo, totalFrames } from "./SpecVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {SPECS.map(({ spec, issues }) => (
        <Composition
          key={spec.id}
          id={spec.id}
          component={SpecVideo}
          durationInFrames={totalFrames(spec)}
          fps={spec.fps}
          width={spec.width}
          height={spec.height}
          defaultProps={{ spec, issues }}
        />
      ))}
    </>
  );
};
