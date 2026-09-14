// 요약: specs/ 의 JSON 을 Studio 에 등록한다. **새 spec 을 만들면 여기 import 한 줄을 추가해야 한다** (빠뜨리면 lint:spec 이 잡는다).
import demo from "../specs/demo-repo-rules.json";
import productDemo from "../specs/template-product-demo-40.json";
import { checkSpec, type Issue } from "./spec/gate";
import type { VideoSpec } from "./spec/schema";

const RAW: unknown[] = [demo, productDemo];

export const SPECS: { spec: VideoSpec; issues: Issue[] }[] = RAW.flatMap((raw) => {
  const { spec, issues } = checkSpec(raw);
  if (!spec) {
    // eslint-disable-next-line no-console
    console.error("[spec] 스키마 파싱 실패 — npm run lint:spec 으로 원인 확인", issues);
    return [];
  }
  return [{ spec, issues }];
});
