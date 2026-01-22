import 'dotenv/config'

import { prisma } from '@/lib/prisma'

import OpenAI from 'openai'

import fs from 'fs'



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })



// Configure which two patches to compare

const OLD_PATCH = process.env.SCRY_PREV_PATCH_VERSION || '29.6.2'

const NEW_PATCH = process.env.SCRY_PATCH_VERSION || '29.6.3'



async function generateMetaReport() {

  console.log('📊 Generating Scrylytics Meta Report between', OLD_PATCH, '→', NEW_PATCH)

  if (!prisma) {
    console.error('❌ Prisma client not available. Cannot generate report.');
    process.exit(1);
  }

  // 1️⃣ Fetch Oracle summaries for both patches

  const oldData = await prisma.oracleInsight.findMany({ where: { patchVersion: OLD_PATCH } })

  const newData = await prisma.oracleInsight.findMany({ where: { patchVersion: NEW_PATCH } })



  // 2️⃣ Align cards by name

  const changes = []

  for (const newEntry of newData) {

    const oldEntry = oldData.find(o => o.cardName === newEntry.cardName)

    if (!oldEntry) {

      changes.push({ type: 'new', ...newEntry })

    } else if (oldEntry.summary !== newEntry.summary) {

      changes.push({ type: 'changed', oldSummary: oldEntry.summary, newSummary: newEntry.summary, cardName: newEntry.cardName })

    }

  }



  console.log('🧩 Found', changes.length, 'cards with updated insights.')



  if (changes.length === 0) {

    console.log('✅ No meta differences detected.')

    process.exit(0)

  }



  // 3️⃣ Summarize changes for AI meta report

  const changeList = changes

    .slice(0, 100) // limit to avoid token overload

    .map(c => {
      if (c.type === 'changed') {
        return `Card: ${c.cardName}\nOld: ${c.oldSummary || '(none)'}\nNew: ${c.newSummary || '(none)'}\n`;
      } else {
        // Type guard: 'new' type has summary property
        const newCard = c as { type: 'new'; cardName: string; summary: string };
        return `Card: ${newCard.cardName}\nOld: (none)\nNew: ${newCard.summary || '(none)'}\n`;
      }
    })

    .join('\n---\n')



  const prompt = `

You are the Oracle Historian of Scrylytics.

Analyze the following list of Hearthstone card Oracle insights from two patches: ${OLD_PATCH} and ${NEW_PATCH}.

Identify key trends, archetype shifts, and any noteworthy changes in strategy or power level.

Write a structured 3-5 paragraph summary suitable for a Meta Update Report, written in an analytical yet mystical tone.

Use markdown headings and bullet points for clarity.



CARD DATA:

${changeList}

`



  const completion = await openai.chat.completions.create({

    model: 'gpt-4o-mini',

    temperature: 0.7,

    messages: [

      { role: 'system', content: 'You are a meta analyst and historian describing balance shifts in Hearthstone.' },

      { role: 'user', content: prompt }

    ],

    max_tokens: 900

  })



  const report = completion.choices[0]?.message?.content?.trim() || 'No report generated.'



  // 4️⃣ Save the report locally

  const filename = `meta_report_${OLD_PATCH}_to_${NEW_PATCH}.md`

  fs.writeFileSync(filename, report)

  console.log('📝 Meta update saved as', filename)

  console.log('\n---\n')

  console.log(report)

  console.log('\n---\n')



  return report

}



generateMetaReport().finally(() => process.exit(0))

