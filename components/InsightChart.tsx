"use client";

import React, { useState, useEffect, Suspense } from "react";

// Dynamic import for Recharts to avoid SSR issues
const RechartsComponents = React.lazy(() =>
  import("recharts").then(module => ({
    ResponsiveContainer: module.ResponsiveContainer,
    BarChart: module.BarChart,
    Bar: module.Bar,
    LineChart: module.LineChart,
    Line: module.Line,
    RadarChart: module.RadarChart,
    Radar: module.Radar,
    PolarGrid: module.PolarGrid,
    PolarAngleAxis: module.PolarAngleAxis,
    PolarRadiusAxis: module.PolarRadiusAxis,
    CartesianGrid: module.CartesianGrid,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    Tooltip: module.Tooltip,
    Legend: module.Legend,
    AreaChart: module.AreaChart,
    Area: module.Area,
    LabelList: module.LabelList
  }))
);

export type DeckIssueType =
  | "MANA_CURVE_SKEW"
  | "DRAW_INCONSISTENCY"
  | "ROLE_MISMATCH"
  | "WEAK_SYNERGY_CHAINS"
  | "TECH_GAPS"
  | "MATCHUP_PAINS"
  | "HAND_SIZE_PRESSURE"
  | "BOARD_TEMPO_GAPS";

export interface InsightChartProps {
  issue: DeckIssueType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  caption?: string;
  title?: string;
}

/* ---------- Parchment Frame ---------- */

const ParchmentFrame: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{
    backgroundColor: "#f5f5dc",
    border: "2px solid #8b4513",
    borderRadius: "8px",
    padding: "1rem",
    margin: "1rem 0",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
  }}>
    {title && (
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "#5c4320", margin: "0 0 0.5rem 0" }}>{title}</h3>
        <div style={{ height: "2px", width: "60px", backgroundColor: "#c7a96f" }} />
      </div>
    )}
    <div>{children}</div>
  </div>
);

/* ---------- Chart Renderers ---------- */

const ManaCurveChart = ({ data }: { data: { mana:number; count:number }[] }) => {
  console.log('📊 ManaCurveChart CALLED with data:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error('❌ ManaCurveChart: Invalid data', { data, type: typeof data, isArray: Array.isArray(data) });
    return <FallbackChart data={data} type="bar" title="Mana Curve (Fallback)" />;
  }

  try {
    console.log('✅ ManaCurveChart: Attempting Recharts render');

    return <ManaCurveChartRenderer data={data} isClient={isClient} />;
  } catch (error) {
    console.error('💥 ManaCurveChart: Recharts FAILED, using fallback', error);
    return <FallbackChart data={data} type="bar" title="Mana Curve (Recharts Failed)" error={error} />;
  }
};

// Fallback Chart Component
const FallbackChart: React.FC<{ data: any; type: string; title: string; error?: any }> = ({ data, type, title, error }) => (
  <div style={{
    padding: "1rem",
    backgroundColor: "#f3f4f6",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    textAlign: "center"
  }}>
    <h4 style={{ color: "#374151", margin: "0 0 1rem 0" }}>
      📈 {title}
    </h4>

    {error && (
      <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "1rem" }}>
        Error: {error.message || String(error)}
      </div>
    )}

    <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" }}>
      Data visualization ({type} chart):
    </div>

    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      justifyContent: "center",
      fontSize: "0.8rem"
    }}>
      {Array.isArray(data) && data.map((item, index) => (
        <div key={index} style={{
          padding: "0.5rem",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "4px",
          minWidth: "60px"
        }}>
          {type === 'bar' && (
            <div>
              <div>Mana {item.mana}</div>
              <div style={{
                height: `${Math.max(item.count * 10, 20)}px`,
                width: "30px",
                backgroundColor: "#8c6d2f",
                margin: "0.25rem auto",
                borderRadius: "2px"
              }}></div>
              <div>{item.count}</div>
            </div>
          )}
          {type !== 'bar' && (
            <pre style={{ fontSize: "0.7rem", margin: 0 }}>
              {JSON.stringify(item, null, 1)}
            </pre>
          )}
        </div>
      ))}
    </div>

    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "1rem" }}>
      This is a fallback visualization when Recharts fails
    </div>
  </div>
);

const LineMetric = ({
  data, xKey, yKey, label
}: { data: any[]; xKey: string; yKey: string; label?: string }) => (
  <ResponsiveContainer width="100%" height={300} minHeight={300}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#b08b4a" opacity={0.45}/>
      <XAxis dataKey={xKey} tick={{ fill: "#5c4320" }} />
      <YAxis tick={{ fill: "#5c4320" }} />
      <Tooltip contentStyle={{ background:"#fff8e6", border:"1px solid #c7a96f" }} />
      <Legend />
      <Line type="monotone" name={label || yKey} dataKey={yKey} stroke="#8c6d2f" strokeWidth={2} dot={{ r:2 }}/>
    </LineChart>
  </ResponsiveContainer>
);

const RoleRadar = ({ data }: { data: { role:string; value:number }[] }) => (
  <ResponsiveContainer width="100%" height={320} minHeight={320}>
    <RadarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
      <PolarGrid stroke="#b08b4a" opacity={0.45}/>
      <PolarAngleAxis dataKey="role" tick={{ fill:"#5c4320" }}/>
      <PolarRadiusAxis tick={{ fill:"#5c4320" }}/>
      <Radar dataKey="value" stroke="#8c6d2f" fill="#8c6d2f" fillOpacity={0.4}/>
    </RadarChart>
  </ResponsiveContainer>
);

const AreaInsight = ({ data, xKey, yKey, label }: { data:any[]; xKey:string; yKey:string; label?:string }) => (
  <ResponsiveContainer width="100%" height={300} minHeight={300}>
    <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#b08b4a" opacity={0.45}/>
      <XAxis dataKey={xKey} tick={{ fill:"#5c4320" }}/>
      <YAxis tick={{ fill:"#5c4320" }}/>
      <Tooltip contentStyle={{ background:"#fff8e6", border:"1px solid #c7a96f" }}/>
      <Legend />
      <Area type="monotone" name={label || yKey} dataKey={yKey} stroke="#8c6d2f" fill="#8c6d2f" fillOpacity={0.35}/>
    </AreaChart>
  </ResponsiveContainer>
);

/* ---------- Main Switch ---------- */

const titleMap: Record<DeckIssueType,string> = {
  MANA_CURVE_SKEW: "Mana Curve Distribution",
  DRAW_INCONSISTENCY: "Card Draw Over Time",
  ROLE_MISMATCH: "Role Distribution",
  WEAK_SYNERGY_CHAINS: "Synergy Flow Strength",
  TECH_GAPS: "Tech Coverage (Counters/Removal)",
  MATCHUP_PAINS: "Matchup Winrate by Archetype",
  HAND_SIZE_PRESSURE: "Average Hand Size by Turn",
  BOARD_TEMPO_GAPS: "Board Tempo/Presence by Turn"
};

const InsightChart: React.FC<InsightChartProps> = ({ issue, data, caption, title }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log('🔍 InsightChart RENDER START:', {
    issue,
    dataLength: data?.length,
    dataType: typeof data,
    dataSample: data?.slice(0, 2),
    title
  });

  // VISUAL DEBUG INDICATOR - If you see this purple box, InsightChart is rendering!
  const debugIndicator = (
    <div style={{
      padding: "0.5rem",
      backgroundColor: "#8b5cf6",
      color: "#ffffff",
      border: "2px solid #000000",
      borderRadius: "4px",
      marginBottom: "1rem",
      fontSize: "0.8rem",
      fontWeight: "bold",
      textAlign: "center"
    }}>
      🟣 InsightChart COMPONENT IS RENDERING! Issue: {issue}, Data: {data?.length || 0} items
    </div>
  );

  const renderChart = () => {
    try {
      console.log('🎯 Rendering chart for issue:', issue, 'with data:', data);

      // Pre-validate data
      if (!data || !Array.isArray(data)) {
        console.error('❌ Invalid data format:', { data, type: typeof data, isArray: Array.isArray(data) });
        return <FallbackChart data={data} type="bar" title="Invalid Data Format" />;
      }

      if (data.length === 0) {
        console.warn('⚠️ Empty data array:', { issue });
        return <FallbackChart data={data} type="bar" title="Empty Data Array" />;
      }

      switch (issue) {
        case "MANA_CURVE_SKEW":
          console.log('📊 Rendering ManaCurveChart with data:', data);
          return <ManaCurveChart data={data as { mana:number; count:number }[]} />;
        case "DRAW_INCONSISTENCY":
          console.log('📈 Rendering LineMetric for draw consistency');
          return <LineMetric data={data} xKey="turn" yKey="cards" label="Cards Drawn" />;
        case "ROLE_MISMATCH":
          console.log('🎯 Rendering RoleRadar for strategy mismatch');
          return <RoleRadar data={data as { role:string; value:number }[]} />;
        case "WEAK_SYNERGY_CHAINS":
          console.log('🌊 Rendering AreaInsight for synergy chains');
          return <AreaInsight data={data} xKey="turn" yKey="chainStrength" label="Chain Strength" />;
        case "TECH_GAPS":
          console.log('🛡️ Rendering ManaCurveChart for tech gaps');
          return <ManaCurveChart data={data as { mana:number; count:number }[]} />;
        case "MATCHUP_PAINS":
          console.log('⚔️ Rendering LineMetric for matchup pains');
          return <LineMetric data={data} xKey="archetype" yKey="winrate" label="Winrate %" />;
        case "HAND_SIZE_PRESSURE":
          console.log('🃏 Rendering AreaInsight for hand pressure');
          return <AreaInsight data={data} xKey="turn" yKey="handSize" label="Avg Hand Size" />;
        case "BOARD_TEMPO_GAPS":
          console.log('⏱️ Rendering RoleRadar for tempo gaps');
          return <RoleRadar data={data as { role:string; value:number }[]} />;
        default:
          console.error('❓ Unknown issue type:', issue);
          return <FallbackChart data={data} type="bar" title="Unknown Issue Type" />;
      }
    } catch (error) {
      console.error('💥 Chart rendering CRASHED:', error, { issue, data, stack: error instanceof Error ? error.stack : 'No stack' });
      const errorMessage = error instanceof Error ? error.message : String(error);
      return <FallbackChart data={data} type="bar" title={`Chart Error: ${errorMessage}`} />;
    }
  };

  return (
    <ParchmentFrame title={title || titleMap[issue]}>
      {debugIndicator}
      <div style={{ minHeight: "320px" }}>
        {renderChart()}
      </div>
      {caption && (
        <p className="mt-3 text-sm italic text-[#5c4320]">
          {caption}
        </p>
      )}
      {/* Debug info */}
      <details className="mt-3 text-xs text-gray-500">
        <summary>Debug Info</summary>
        <pre>Issue: {issue}, Data points: {data?.length || 0}</pre>
        <pre>Data sample: {JSON.stringify(data?.slice(0, 2), null, 2)}</pre>
      </details>
    </ParchmentFrame>
  );
};

// Separate component for ManaCurveChart that can access isClient
const ManaCurveChartRenderer: React.FC<{ data: any[]; isClient: boolean }> = ({ data, isClient }) => {
  // Only render Recharts on client side
  if (!isClient) {
    return (
      <div style={{
        padding: "2rem",
        backgroundColor: "#f0f0f0",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        textAlign: "center",
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>
          <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>📊</div>
          <div>Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div style={{
        padding: "2rem",
        backgroundColor: "#f0f0f0",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        textAlign: "center",
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>
          <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>⏳</div>
          <div>Loading Recharts...</div>
        </div>
      </div>
    }>
      <RechartsComponents.ResponsiveContainer width="100%" height={300}>
        <RechartsComponents.BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <RechartsComponents.CartesianGrid strokeDasharray="3 3" stroke="#b08b4a" opacity={0.45}/>
          <RechartsComponents.XAxis dataKey="mana" tick={{ fill: "#5c4320" }} />
          <RechartsComponents.YAxis tick={{ fill: "#5c4320" }} />
          <RechartsComponents.Tooltip contentStyle={{ background:"#fff8e6", border:"1px solid #c7a96f" }} />
          <RechartsComponents.Bar dataKey="count" fill="#8c6d2f" radius={[6,6,0,0]}>
            <RechartsComponents.LabelList dataKey="count" position="top" fill="#5c4320" />
          </RechartsComponents.Bar>
        </RechartsComponents.BarChart>
      </RechartsComponents.ResponsiveContainer>
    </Suspense>
  );
};

export default InsightChart;
