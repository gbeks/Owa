import { useState } from "react";

const tokens = {
  night: "#12121F",
  night2: "#1A1A2E",
  night3: "#20203A",
  nightCard: "#252545",
  dust: "#F5F0E8",
  gold: "#C9963A",
  goldDim: "rgba(201,150,58,0.12)",
  goldBorder: "rgba(201,150,58,0.25)",
  goldBright: "#E2B05A",
  sand: "#C4A882",
  mist: "#8E9BAE",
  white: "#FAFAF8",
  divider: "rgba(255,255,255,0.06)",
};

const vehicleStyles = {
  Danfo: { bg: "rgba(201,150,58,0.15)", text: "#C9963A" },
  BRT: { bg: "rgba(99,145,210,0.15)", text: "#6391D2" },
  Korope: { bg: "rgba(130,196,140,0.15)", text: "#82C48C" },
  Keke: { bg: "rgba(196,168,130,0.2)", text: "#C4A882" },
  Walk: { bg: "rgba(142,155,174,0.12)", text: "#8E9BAE" },
};

const popularRoutes = [
  { from: "Ojuelegba", to: "Ketu Alapere" },
  { from: "Surulere", to: "Lekki Phase 1" },
  { from: "Ikeja Along", to: "Obalende" },
  { from: "Yaba", to: "Victoria Island" },
  { from: "Oshodi", to: "CMS" },
];

const sampleDirections = [
  {
    step: 1,
    vehicle: "Danfo",
    label: "Danfo (Yellow Bus)",
    from: "Ojuelegba, by the bridge",
    to: "Ketu Bus Stop",
    instruction: "At Ojuelegba, go to the bus stop by the bridge. Board a danfo calling 'Ketu'. Ride to Ketu Bus Stop.",
    fareMin: 700,
    fareMax: 1200,
    verified: true,
  },
  {
    step: 2,
    vehicle: "Walk",
    label: "Walk",
    from: "Ketu Bus Stop overhead bridge",
    to: "Ikosi Ketu",
    instruction: "After dropping, use the overhead bridge to cross to the other side of the expressway. Proceed to Ikosi Ketu from there.",
    fareMin: 0,
    fareMax: 0,
    verified: true,
  },
  {
    step: 3,
    vehicle: "Korope",
    label: "Korope (Mini-bus) / Keke Marwa",
    from: "Ketu Garage",
    to: "Alapere",
    instruction: "Walk into Ketu Garage. Board a korope or keke going to Alapere.",
    fareMin: 200,
    fareMax: 500,
    verified: true,
  },
];

const palette = [
  { name: "Night", hex: "#12121F", role: "Primary background" },
  { name: "Gold", hex: "#C9963A", role: "Primary accent / CTA" },
  { name: "Gold Bright", hex: "#E2B05A", role: "Hover / highlight states" },
  { name: "Sand", hex: "#C4A882", role: "Secondary text / fares" },
  { name: "Mist", hex: "#8E9BAE", role: "Labels / disabled" },
  { name: "Dust", hex: "#F5F0E8", role: "Light surface" },
];

function VehicleTag({ type, label }) {
  const style = vehicleStyles[type] || vehicleStyles.Walk;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: style.bg,
        color: style.text,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        letterSpacing: "0.02em",
        marginBottom: 5,
      }}
    >
      {label}
    </span>
  );
}

function StepConnector({ last }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 18,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 4,
          background: tokens.gold,
        }}
      />
      {!last && (
        <div
          style={{
            width: 1.5,
            flex: 1,
            background: `linear-gradient(to bottom, rgba(201,150,58,0.35), rgba(201,150,58,0.06))`,
            minHeight: 32,
            margin: "3px 0",
          }}
        />
      )}
    </div>
  );
}

function FareBadge({ min, max, verified }) {
  if (min === 0 && max === 0) return null;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          fontWeight: 700,
          color: tokens.sand,
        }}
      >
        ₦{min.toLocaleString()} – ₦{max.toLocaleString()}
      </span>
      {!verified && (
        <span style={{ fontSize: 10, color: tokens.mist }}>unconfirmed</span>
      )}
    </span>
  );
}

function SaveToast({ visible }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 72,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : 14}px)`,
        opacity: visible ? 1 : 0,
        transition: "all 0.22s ease",
        background: "#1e1e3a",
        border: `1px solid ${tokens.goldBorder}`,
        borderRadius: 10,
        padding: "9px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        zIndex: 100,
        pointerEvents: "none",
        boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: tokens.gold, fontSize: 13 }}>✓</span>
      <span style={{ fontSize: 13, color: tokens.white }}>Route saved</span>
    </div>
  );
}

function HomeScreen() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showDirections, setShowDirections] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const swap = () => {
    const t = from;
    setFrom(to);
    setTo(t);
  };

  const handleSearch = () => setShowDirections(true);

  const handleChip = (r) => {
    setFrom(r.from);
    setTo(r.to);
    setShowDirections(true);
  };

  const handleSave = () => {
    if (!saved) {
      setSaved(true);
      setSavedCount((c) => c + 1);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2200);
    } else {
      setSaved(false);
      setSavedCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <div
      style={{
        background: tokens.night2,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SaveToast visible={showToast} />

      {/* Header */}
      <div
        style={{
          padding: "28px 22px 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: tokens.white,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            owa
            <span style={{ color: tokens.gold }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: tokens.mist, marginTop: 2, letterSpacing: "0.02em" }}>
            Lagos transit, step by step
          </div>
        </div>

        {savedCount > 0 && (
          <div
            style={{
              background: tokens.nightCard,
              borderRadius: 20,
              padding: "5px 11px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: `1px solid ${tokens.divider}`,
            }}
          >
            <span style={{ fontSize: 13, color: tokens.gold }}>🔖</span>
            <span style={{ fontSize: 12, color: tokens.sand }}>{savedCount} saved</span>
          </div>
        )}
      </div>

      {/* Peak banner */}
      <div
        style={{
          margin: "16px 22px 0",
          padding: "11px 14px",
          background: "rgba(201,150,58,0.07)",
          borderLeft: `2.5px solid ${tokens.gold}`,
          borderRadius: "0 8px 8px 0",
        }}
      >
        <p style={{ fontSize: 12, color: tokens.sand, lineHeight: 1.5 }}>
          Peak hours active. Fares may be higher than shown.
        </p>
      </div>

      {/* Search */}
      <div
        style={{
          margin: "16px 22px 0",
          background: tokens.nightCard,
          borderRadius: 12,
          border: `1px solid ${tokens.divider}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ padding: "12px 46px 12px 16px", borderBottom: `1px solid ${tokens.divider}` }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: tokens.mist,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            From
          </div>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Where are you starting from?"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: from ? tokens.white : "rgba(142,155,174,0.5)",
              width: "100%",
              padding: 0,
            }}
          />
        </div>
        <div style={{ padding: "12px 46px 12px 16px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: tokens.mist,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            To
          </div>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Where are you going?"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: to ? tokens.white : "rgba(142,155,174,0.5)",
              width: "100%",
              padding: 0,
            }}
          />
        </div>
        <button
          onClick={swap}
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: tokens.night3,
            border: `1px solid rgba(142,155,174,0.15)`,
            borderRadius: 8,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: tokens.mist,
            fontSize: 13,
          }}
        >
          ⇅
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={handleSearch}
        style={{
          margin: "12px 22px 0",
          background: tokens.gold,
          border: "none",
          borderRadius: 12,
          padding: "14px",
          fontSize: 15,
          fontWeight: 600,
          color: tokens.night,
          cursor: "pointer",
          letterSpacing: "0.01em",
          transition: "background 0.15s",
        }}
      >
        Find route
      </button>

      {/* Directions */}
      {showDirections && (
        <div
          style={{
            margin: "16px 22px 0",
            background: tokens.nightCard,
            borderRadius: 12,
            border: `1px solid ${tokens.divider}`,
            overflow: "hidden",
          }}
        >
          {/* Route header */}
          <div
            style={{
              padding: "16px 16px 14px",
              borderBottom: `1px solid ${tokens.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: tokens.white,
                  letterSpacing: "-0.01em",
                  marginBottom: 7,
                }}
              >
                Ojuelegba → Ketu Alapere
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: tokens.gold,
                  }}
                >
                  ₦900 – ₦1,700
                </span>
                <span
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 13,
                    color: tokens.sand,
                  }}
                >
                  ~55 min
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                background: saved ? tokens.goldDim : "transparent",
                border: `1px solid ${saved ? tokens.goldBorder : "rgba(142,155,174,0.2)"}`,
                borderRadius: 8,
                padding: "6px 11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 12 }}>🔖</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: saved ? tokens.gold : tokens.mist,
                }}
              >
                {saved ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          {/* Steps */}
          <div style={{ padding: "18px 16px 8px" }}>
            {sampleDirections.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <StepConnector last={i === sampleDirections.length - 1} />
                <div
                  style={{
                    flex: 1,
                    paddingBottom: i < sampleDirections.length - 1 ? 18 : 8,
                  }}
                >
                  <VehicleTag type={step.vehicle} label={step.label} />
                  <div style={{ fontSize: 11, color: tokens.mist, marginBottom: 3 }}>
                    {step.from}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: tokens.white,
                      lineHeight: 1.6,
                      marginBottom: 6,
                    }}
                  >
                    {step.instruction}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 11, color: tokens.mist }}>→ {step.to}</span>
                    <FareBadge
                      min={step.fareMin}
                      max={step.fareMax}
                      verified={step.verified}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: `1px solid ${tokens.divider}`,
              padding: "11px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: tokens.mist,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Something wrong? Tell us.
            </span>
            <span
              style={{ fontSize: 11, color: tokens.mist, cursor: "pointer" }}
              onClick={() => setShowDirections(false)}
            >
              Close ×
            </span>
          </div>
        </div>
      )}

      {/* Popular routes */}
      <div style={{ padding: "20px 22px 32px" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: tokens.mist,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          Popular routes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {popularRoutes.map((r, i) => (
            <button
              key={i}
              onClick={() => handleChip(r)}
              style={{
                background: tokens.nightCard,
                border: `1px solid ${tokens.divider}`,
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ color: tokens.gold, fontSize: 11, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: tokens.white }}>{r.from}</span>
              <span style={{ fontSize: 11, color: tokens.mist }}>to</span>
              <span style={{ fontSize: 13, color: tokens.white }}>{r.to}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandSheet() {
  return (
    <div style={{ background: tokens.dust, minHeight: "100%", padding: 36 }}>

      {/* Wordmark */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          Wordmark
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: tokens.night,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          owa<span style={{ color: tokens.gold }}>.</span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#888",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Lagos transit, step by step
        </div>
      </div>

      {/* Palette */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          Colour palette
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {palette.map((c, i) => (
            <div key={i} style={{ width: 76 }}>
              <div
                style={{
                  width: 76,
                  height: 48,
                  background: c.hex,
                  borderRadius: 8,
                  marginBottom: 6,
                  border:
                    c.hex === "#F5F0E8" || c.hex === "#FAFAF8"
                      ? "1px solid #ddd"
                      : c.hex === "#12121F"
                      ? "1px solid #333"
                      : "none",
                }}
              />
              <div style={{ fontSize: 10, fontWeight: 600, color: tokens.night, marginBottom: 1 }}>
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 9,
                  color: "#999",
                  marginBottom: 2,
                }}
              >
                {c.hex}
              </div>
              <div style={{ fontSize: 9, color: "#aaa", lineHeight: 1.3 }}>{c.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle tags */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          Vehicle tags
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(vehicleStyles).map(([type, style]) => {
            const labels = {
              Danfo: "Danfo (Yellow Bus)",
              BRT: "BRT (Blue/Red Bus)",
              Korope: "Korope (Mini-bus)",
              Keke: "Keke Marwa",
              Walk: "Walk",
            };
            return (
              <span
                key={type}
                style={{
                  background: style.bg,
                  color: style.text,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.02em",
                }}
              >
                {labels[type]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Typography */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          Typography
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: tokens.night,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              Inter Black
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
              Display / Wordmark / Route names — 900 weight
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: tokens.night,
                lineHeight: 1.6,
                maxWidth: 420,
              }}
            >
              At Ojuelegba, go to the bus stop by the bridge. Board a danfo
              calling 'Ketu'. Ride to Ketu Bus Stop.
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
              Inter Regular 15px — Body / Instructions / UI labels
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: tokens.night,
              }}
            >
              ₦700 – ₦1,200
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
              Courier New Bold — Fares / Data / Codes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwaVisuals() {
  const [screen, setScreen] = useState("home");

  const tabs = [
    { id: "home", label: "App" },
    { id: "brand", label: "Brand" },
  ];

  return (
    <div
      style={{
        background: "#0a0a14",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 16px 48px",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "#15152A",
          borderRadius: 10,
          padding: 4,
          marginBottom: 28,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            style={{
              background: screen === t.id ? tokens.gold : "transparent",
              border: "none",
              borderRadius: 7,
              padding: "7px 22px",
              fontSize: 13,
              fontWeight: 500,
              color: screen === t.id ? tokens.night : tokens.mist,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {screen === "home" ? (
        <div
          style={{
            width: 375,
            maxWidth: "100%",
            background: tokens.night2,
            borderRadius: 44,
            border: "8px solid #1e1e2e",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Notch */}
          <div
            style={{
              background: "#15152A",
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 6,
                background: "#2a2a40",
                borderRadius: 3,
              }}
            />
          </div>
          <div style={{ overflowY: "auto", maxHeight: 740 }}>
            <HomeScreen />
          </div>
        </div>
      ) : (
        <div
          style={{
            width: 600,
            maxWidth: "100%",
            background: tokens.dust,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          <BrandSheet />
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          fontSize: 11,
          color: "#444",
          textAlign: "center",
        }}
      >
        {screen === "home"
          ? "Tap a popular route or 'Find route' to see inline directions"
          : "Brand sheet — wordmark, colours, vehicle tags, type scale"}
      </div>
    </div>
  );
}
