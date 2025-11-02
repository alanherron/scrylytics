// DeckCompositionSunburst.tsx

import React, { useMemo } from "react";

import {

  ResponsiveContainer,

  PieChart,

  Pie,

  Sector,

  Tooltip,

  Legend,

} from "recharts";

/**

 * ---------------------------

 * Demo input (replace freely)

 * ---------------------------

 * Provide counts by top-level type, and subtype buckets per type.

 * Minion subtypes correspond to Race/Type; Spell subtypes to School.

 */

const demo = {

  types: {

    Minion: 32,

    Spell: 20,

    Weapon: 4,

    Hero: 2,

    Location: 2,

  },

  minionSubtypes: {

    Beast: 6,

    Demon: 2,

    Dragon: 4,

    Elemental: 3,

    Mech: 5,

    Murloc: 3,

    Naga: 1,

    Pirate: 2,

    Quilboar: 1,

    Totem: 1,

    Undead: 3,

    General: 1, // catch-all / no specific tribe

  },

  spellSchools: {

    Arcane: 3,

    Fel: 1,

    Fire: 4,

    Frost: 3,

    Holy: 2,

    Nature: 4,

    Shadow: 2,

    General: 1, // no school

  },

  // Only applies to Death Knight builds (example shown under Minions)

  dkRunes: {

    Blood: 3,

    Frost: 2,

    Unholy: 4,

  },

  // How many of the Minions are DK cards (to gate the rune ring area)

  dkMinionsCount: 9,

};

/**

 * Palette helpers (simple but distinct). Feel free to swap with your brand tokens.

 */

const COLORS_TYPE = ["#5B6EE1", "#F29D38", "#F25F5C", "#7BC96F", "#AF7AB3"];

const COLORS_MINION = [

  "#4F83CC", "#8E6C8A", "#F0B67F", "#C7EFCF", "#A1C6EA", "#E5989B",

  "#6DD3CE", "#FFD166", "#9FD356", "#90BE6D", "#577590", "#BDB2FF"

];

const COLORS_SCHOOL = [

  "#6E56CF", "#1DB954", "#FF6B6B", "#4FC3F7", "#FFDD57", "#33CC99", "#7E57C2", "#B0BEC5"

];

const COLORS_RUNES = ["#B71C1C", "#1565C0", "#2E7D32"];

/**

 * Utility: build arc slices with explicit start/end angles so child rings

 * line up perfectly under their parent arc.

 */

type Slice = {

  name: string;

  value: number;

  depth: 1 | 2 | 3;

  startAngle: number;

  endAngle: number;

  color: string;

  parent?: string; // for tooltip context

};

function buildSunburst(demoData: typeof demo) {

  const total =

    demoData.types.Minion +

    demoData.types.Spell +

    demoData.types.Weapon +

    demoData.types.Hero +

    demoData.types.Location;

  // 1) Inner ring: types

  let cursor = 0;

  const typeEntries = Object.entries(demoData.types);

  const typeSlices: Slice[] = typeEntries.map(([name, value], i) => {

    const sweep = (value / total) * 360;

    const slice: Slice = {

      name,

      value,

      depth: 1,

      startAngle: 90 - cursor - sweep,

      endAngle: 90 - cursor,

      color: COLORS_TYPE[i % COLORS_TYPE.length],

    };

    cursor += sweep;

    return slice;

  });

  // Lookup helpers

  const findTypeSlice = (name: string) => typeSlices.find(s => s.name === name)!;

  // 2) Middle ring: subtypes

  const middleSlices: Slice[] = [];

  // Minion subtypes under the Minion arc

  const minionParent = findTypeSlice("Minion");

  const minionTotal = Object.values(demoData.minionSubtypes).reduce((a, b) => a + b, 0) || 1;

  let minionCursor = minionParent.startAngle;

  const minionSweepTotal = minionParent.endAngle - minionParent.startAngle; // positive

  Object.entries(demoData.minionSubtypes).forEach(([name, value], i) => {

    const portion = value / minionTotal;

    const sweep = minionSweepTotal * portion;

    const slice: Slice = {

      name,

      value,

      depth: 2,

      parent: "Minion",

      startAngle: minionCursor,

      endAngle: minionCursor + sweep,

      color: COLORS_MINION[i % COLORS_MINION.length],

    };

    minionCursor += sweep;

    middleSlices.push(slice);

  });

  // Spell schools under the Spell arc

  const spellParent = findTypeSlice("Spell");

  const schoolTotal = Object.values(demoData.spellSchools).reduce((a, b) => a + b, 0) || 1;

  let schoolCursor = spellParent.startAngle;

  const schoolSweepTotal = spellParent.endAngle - spellParent.startAngle;

  Object.entries(demoData.spellSchools).forEach(([name, value], i) => {

    const portion = value / schoolTotal;

    const sweep = schoolSweepTotal * portion;

    const slice: Slice = {

      name,

      value,

      depth: 2,

      parent: "Spell",

      startAngle: schoolCursor,

      endAngle: schoolCursor + sweep,

      color: COLORS_SCHOOL[i % COLORS_SCHOOL.length],

    };

    schoolCursor += sweep;

    middleSlices.push(slice);

  });

  // Weapons/Hero/Location have no second level in this demo (you could add if you like)

  // 3) Outer ring (third level): DK runes under DK-minion portion of the Minion ring

  // We reserve a sub-arc of the Minion arc proportional to dkMinionsCount of Minion total.

  const dkSlices: Slice[] = [];

  if (demoData.dkMinionsCount > 0 && minionParent.value > 0) {

    const dkPortion = demoData.dkMinionsCount / minionParent.value;

    const dkSweep = (minionParent.endAngle - minionParent.startAngle) * dkPortion;

    const dkStart = minionParent.startAngle; // place at the leading edge of Minion arc

    let dkCursor = dkStart;

    const runesTotal = Object.values(demoData.dkRunes).reduce((a, b) => a + b, 0) || 1;

    Object.entries(demoData.dkRunes).forEach(([name, value], i) => {

      const portion = value / runesTotal;

      const sweep = dkSweep * portion;

      dkSlices.push({

        name: name + " Rune",

        value,

        depth: 3,

        parent: "Death Knight",

        startAngle: dkCursor,

        endAngle: dkCursor + sweep,

        color: COLORS_RUNES[i % COLORS_RUNES.length],

      });

      dkCursor += sweep;

    });

  }

  return { typeSlices, middleSlices, dkSlices, total };

}

/**

 * Tooltip with clear hierarchy path and percentages.

 */

function DeckTooltip({

  active, payload, label,

}: any) {

  if (!active || !payload || !payload.length) return null;

  const p = payload[0].payload as Slice & { percent?: number };

  const percent = payload[0].percent ?? (p.value / (payload[0].payload.total || 1));

  const pct = (percent * 100).toFixed(1);

  return (

    <div

      style={{

        background: "rgba(30, 30, 40, 0.92)",

        color: "white",

        padding: "10px 12px",

        borderRadius: 8,

        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",

        border: "1px solid rgba(255,255,255,0.12)",

        maxWidth: 260,

      }}

    >

      <div style={{ fontWeight: 700, marginBottom: 6 }}>

        {p.depth === 1 && p.name}

        {p.depth === 2 && `${p.parent} → ${p.name}`}

        {p.depth === 3 && `Minion (DK) → ${p.name}`}

      </div>

      <div style={{ fontSize: 13, opacity: 0.9 }}>

        Cards: <b>{p.value}</b> • Share: <b>{pct}%</b>

      </div>

      {p.depth === 1 && (

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>

          Top Level: Overall {p.name} cards in the deck.

        </div>

      )}

      {p.depth === 2 && p.parent === "Minion" && (

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>

          Minion Type: {p.name}. Shows how your minions split across tribes.

        </div>

      )}

      {p.depth === 2 && p.parent === "Spell" && (

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>

          Spell School: {p.name}. Explains what kind of magic your spells use.

        </div>

      )}

      {p.depth === 3 && (

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>

          Death Knight Rune: {p.name.replace(" Rune", "")}. Indicates rune pressure within DK minions.

        </div>

      )}

    </div>

  );

}

/**

 * Custom sector (slightly rounded ends) for a nicer look.

 */

const RoundSector = (props: any) => <Sector {...props} cornerRadius={4} />;

export default function DeckCompositionSunburst() {

  const { typeSlices, middleSlices, dkSlices, total } = useMemo(

    () => buildSunburst(demo),

    []

  );

  // Radii (tweak as desired)

  const innerR = 48;          // hole

  const typeOuterR = 100;     // ring 1 outer

  const middleOuterR = 140;   // ring 2 outer

  const outerOuterR = 170;    // ring 3 outer

  return (

    <div style={{ width: "100%", height: 420, background: "transparent" }}>

      <ResponsiveContainer>

        <PieChart>

          {/* INNER: CARD TYPES */}

          <Pie

            data={typeSlices}

            dataKey="value"

            nameKey="name"

            startAngle={90}

            endAngle={-270}

            innerRadius={innerR}

            outerRadius={typeOuterR}

            stroke="#1f1f28"

            strokeWidth={1}

            isAnimationActive

            activeShape={RoundSector}

            // Use each slice's angles (override global) by passing in a custom sector props mapper

            // Recharts uses each item start/end when present:

            // @ts-ignore

            sectors={typeSlices.map((d, i) => ({

              ...d,

              fill: d.color,

            }))}

          >

            {typeSlices.map((d, i) => (

              <RoundSector key={`t-${i}`} />

            ))}

          </Pie>

          {/* MIDDLE: MINION TYPES + SPELL SCHOOLS (multiple pies, aligned under their parent) */}

          {/* Minion subtypes */}

          <Pie

            data={middleSlices.filter(s => s.parent === "Minion")}

            dataKey="value"

            nameKey="name"

            innerRadius={typeOuterR + 6}

            outerRadius={middleOuterR}

            stroke="#1f1f28"

            strokeWidth={1}

            isAnimationActive

            activeShape={RoundSector}

            // @ts-ignore

            sectors={middleSlices

              .filter(s => s.parent === "Minion")

              .map((d) => ({ ...d, fill: d.color }))}

          >

            {middleSlices

              .filter(s => s.parent === "Minion")

              .map((d, i) => (

                <RoundSector key={`m-minion-${i}`} />

              ))}

          </Pie>

          {/* Spell schools */}

          <Pie

            data={middleSlices.filter(s => s.parent === "Spell")}

            dataKey="value"

            nameKey="name"

            innerRadius={typeOuterR + 6}

            outerRadius={middleOuterR}

            stroke="#1f1f28"

            strokeWidth={1}

            isAnimationActive

            activeShape={RoundSector}

            // @ts-ignore

            sectors={middleSlices

              .filter(s => s.parent === "Spell")

              .map((d) => ({ ...d, fill: d.color }))}

          >

            {middleSlices

              .filter(s => s.parent === "Spell")

              .map((d, i) => (

                <RoundSector key={`m-spell-${i}`} />

              ))}

          </Pie>

          {/* OUTER: DK RUNES (only if dkMinionsCount > 0) */}

          {dkSlices.length > 0 && (

            <Pie

              data={dkSlices}

              dataKey="value"

              nameKey="name"

              innerRadius={middleOuterR + 6}

              outerRadius={outerOuterR}

              stroke="#1f1f28"

              strokeWidth={1}

              isAnimationActive

              activeShape={RoundSector}

              // @ts-ignore

              sectors={dkSlices.map((d) => ({ ...d, fill: d.color }))}

            >

              {dkSlices.map((d, i) => (

                <RoundSector key={`dk-${i}`} />

              ))}

            </Pie>

          )}

          <Tooltip content={<DeckTooltip />} />

          <Legend

            verticalAlign="bottom"

            align="center"

            iconType="circle"

            formatter={(value) => <span style={{ color: "#333" }}>{value}</span>}

          />

        </PieChart>

      </ResponsiveContainer>

      {/* Caption / Guidance */}

      <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, opacity: 0.8 }}>

        Inner: Card Types • Middle: Minion Types or Spell Schools • Outer: DK Runes (if present)

      </div>

    </div>

  );

}
