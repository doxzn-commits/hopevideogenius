// 요약: 지속 카드의 틀. **씬이 바뀌어도 이 틀은 같은 자리에 그대로 있고 머리글 값만 바뀐다.**
// 그래서 카드형 영상은 컷 없이 "내용만 교체되는" 것처럼 보인다. 씬 컴포넌트는 내용만 그린다.
import React from "react";
import { CARD } from "../spec/layout";
import { FONT_UI } from "../fonts";
import type { Palette } from "../theme";
import type { Scene } from "../spec/schema";

export const CardShell: React.FC<{ p: Palette; card: NonNullable<Scene["card"]> }> = ({ p, card }) => {
  const body = p.cardBody ?? p.card;
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.top,
        width: CARD.width,
        height: CARD.height,
        borderRadius: CARD.radius,
        overflow: "hidden",
        background: body,
        border: `1.5px solid ${p.cardBorder}`,
        boxShadow: "0 30px 90px rgba(40,30,20,0.12)",
      }}
    >
      {/* 머리글 — 앱 아이콘·이름·연결 상태·진행(N / 5) */}
      <div
        style={{
          height: CARD.headerH,
          background: p.card,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: `0 ${CARD.pad}px`,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 26,
            background: card.tint ?? "#1A1A1A",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 44,
            flexShrink: 0,
          }}
        >
          {card.glyph}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 46,
              color: "#1A1A1A",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {card.app}
          </div>
          {card.status ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#1E8E54" }} />
              <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, color: "#1E8E54" }}>{card.status}</div>
            </div>
          ) : null}
        </div>
        {card.index && card.total ? (
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 42, color: "#1A1A1A", flexShrink: 0 }}>
            {card.index} / {card.total}
          </div>
        ) : null}
      </div>
    </div>
  );
};
